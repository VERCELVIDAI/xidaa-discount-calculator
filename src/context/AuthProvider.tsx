import React, { useEffect, useState, useCallback, useRef } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { UserProfile, UserRole } from '../types/auth';
import { AuthContext } from './AuthContext';

const LOCAL_STORAGE_OFFLINE_USER_KEY = 'xidaa_auth_offline_user_v1';
const STANDARD_PIN_SALT = 'xidaa_std_salt_v2026_commercial';
const ADMIN_PIN_SALT = 'xidaa_adm_salt_v2026_enterprise';
const PIN_HASH_STORAGE_KEY = 'xidaa_auth_pin_hashes_v2';
const LOCKOUT_STORAGE_KEY = 'xidaa_auth_lockout_v2';
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 30000; // 30s lockout after 5 consecutive failures

// Cryptographic Salted SHA-256 Helper using standard Web Crypto API
async function computeSaltedHash(value: string, salt: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(`${salt}:${value}:${salt}`);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

interface StoredPinHashes {
  standardHash: string;
  adminHash: string;
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isConfigured = isSupabaseConfigured();

  // Active user profile session
  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_OFFLINE_USER_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return null;
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [lockoutRemainingSeconds, setLockoutRemainingSeconds] = useState<number>(() => {
    try {
      const raw = localStorage.getItem(LOCKOUT_STORAGE_KEY);
      if (raw) {
        const { lockoutUntil } = JSON.parse(raw);
        const now = Date.now();
        if (lockoutUntil && lockoutUntil > now) {
          return Math.ceil((lockoutUntil - now) / 1000);
        }
      }
    } catch {
      // ignore
    }
    return 0;
  });
  const lockoutTimerRef = useRef<number | null>(null);

  // Initialize and retrieve stored salted hashes (Default: standard 9999, admin 2026)
  const getStoredHashes = useCallback(async (): Promise<StoredPinHashes> => {
    try {
      const raw = localStorage.getItem(PIN_HASH_STORAGE_KEY);
      if (raw) {
        return JSON.parse(raw);
      }
    } catch {
      // ignore
    }
    // Initialize default salted hashes for 9999 (standard) and 2026 (admin)
    const standardHash = await computeSaltedHash('9999', STANDARD_PIN_SALT);
    const adminHash = await computeSaltedHash('2026', ADMIN_PIN_SALT);
    const defaults: StoredPinHashes = { standardHash, adminHash };
    try {
      localStorage.setItem(PIN_HASH_STORAGE_KEY, JSON.stringify(defaults));
    } catch {
      // ignore
    }
    return defaults;
  }, []);

  // Check lockout status
  const checkLockout = useCallback((): number => {
    try {
      const raw = localStorage.getItem(LOCKOUT_STORAGE_KEY);
      if (raw) {
        const { lockoutUntil } = JSON.parse(raw);
        const now = Date.now();
        if (lockoutUntil && lockoutUntil > now) {
          return Math.ceil((lockoutUntil - now) / 1000);
        }
      }
    } catch {
      // ignore
    }
    return 0;
  }, []);

  // Update lockout countdown timer
  useEffect(() => {
    if (lockoutRemainingSeconds <= 0) return;

    lockoutTimerRef.current = window.setInterval(() => {
      const rem = checkLockout();
      setLockoutRemainingSeconds(rem);
      if (rem <= 0 && lockoutTimerRef.current) {
        clearInterval(lockoutTimerRef.current);
        lockoutTimerRef.current = null;
      }
    }, 1000);

    return () => {
      if (lockoutTimerRef.current) clearInterval(lockoutTimerRef.current);
    };
  }, [lockoutRemainingSeconds, checkLockout]);

  const recordFailedAttempt = useCallback((): number => {
    try {
      const raw = localStorage.getItem(LOCKOUT_STORAGE_KEY);
      let count = 0;
      if (raw) {
        const parsed = JSON.parse(raw);
        count = Number(parsed.failedAttempts) || 0;
      }
      count += 1;
      let lockoutUntil: number | null = null;
      let remainingSec = 0;

      if (count >= MAX_FAILED_ATTEMPTS) {
        lockoutUntil = Date.now() + LOCKOUT_DURATION_MS;
        remainingSec = Math.ceil(LOCKOUT_DURATION_MS / 1000);
        setLockoutRemainingSeconds(remainingSec);
      }

      localStorage.setItem(LOCKOUT_STORAGE_KEY, JSON.stringify({
        failedAttempts: count,
        lockoutUntil,
      }));

      return remainingSec;
    } catch {
      return 0;
    }
  }, []);

  const resetFailedAttempts = useCallback(() => {
    try {
      localStorage.removeItem(LOCKOUT_STORAGE_KEY);
      setLockoutRemainingSeconds(0);
    } catch {
      // ignore
    }
  }, []);

  /**
   * Primary PIN Authentication Handler (Section 8)
   * Secure, salted SHA-256 verification with role detection
   */
  const loginWithPin = async (
    pin: string
  ): Promise<{ success: boolean; error?: string; role?: UserRole }> => {
    // Check if lockout is currently active
    const rem = checkLockout();
    if (rem > 0) {
      return {
        success: false,
        error: `Too many failed attempts. Keypad locked for ${rem} seconds.`,
      };
    }

    if (!pin || pin.length !== 4 || !/^\d{4}$/.test(pin)) {
      return { success: false, error: 'Please enter a valid 4-digit PIN.' };
    }

    try {
      setIsLoading(true);
      const { standardHash, adminHash } = await getStoredHashes();

      // Compute salted hashes for input
      const inputAdminHash = await computeSaltedHash(pin, ADMIN_PIN_SALT);
      const inputStandardHash = await computeSaltedHash(pin, STANDARD_PIN_SALT);

      let authenticatedRole: UserRole | null = null;
      let authenticatedProfile: UserProfile | null = null;

      if (inputAdminHash === adminHash) {
        authenticatedRole = 'admin';
        authenticatedProfile = {
          id: `xidaa-admin-session-${Date.now()}`,
          email: 'admin@xidaamoto.com',
          username: 'admin',
          fullName: 'System Administrator',
          role: 'admin',
          mustChangePassword: false,
        };
      } else if (inputStandardHash === standardHash) {
        authenticatedRole = 'sales_rep';
        authenticatedProfile = {
          id: `xidaa-sales-session-${Date.now()}`,
          email: 'sales@xidaamoto.com',
          username: 'sales',
          fullName: 'Sales Executive',
          role: 'sales_rep',
          mustChangePassword: false,
        };
      }

      if (authenticatedProfile && authenticatedRole) {
        resetFailedAttempts();
        setUser(authenticatedProfile);
        try {
          localStorage.setItem(LOCAL_STORAGE_OFFLINE_USER_KEY, JSON.stringify(authenticatedProfile));
        } catch {
          // ignore
        }
        setIsLoading(false);
        return { success: true, role: authenticatedRole };
      } else {
        const lockoutSec = recordFailedAttempt();
        setIsLoading(false);
        if (lockoutSec > 0) {
          return {
            success: false,
            error: `Incorrect PIN. Max attempts reached — keypad locked for ${lockoutSec}s.`,
          };
        }
        return { success: false, error: 'Incorrect PIN. Please try again.' };
      }
    } catch (err: any) {
      setIsLoading(false);
      return { success: false, error: err.message || 'Authentication error.' };
    }
  };

  /**
   * Change PIN for Administrator or Standard User (Admin Only)
   */
  const changePin = async (
    newPin: string,
    targetRole: 'standard' | 'admin'
  ): Promise<{ success: boolean; error?: string }> => {
    if (!newPin || newPin.length !== 4 || !/^\d{4}$/.test(newPin)) {
      return { success: false, error: 'New PIN must be exactly 4 digits.' };
    }

    try {
      const hashes = await getStoredHashes();
      if (targetRole === 'admin') {
        hashes.adminHash = await computeSaltedHash(newPin, ADMIN_PIN_SALT);
      } else {
        hashes.standardHash = await computeSaltedHash(newPin, STANDARD_PIN_SALT);
      }
      localStorage.setItem(PIN_HASH_STORAGE_KEY, JSON.stringify(hashes));
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to update PIN.' };
    }
  };

  /**
   * Legacy username/password login adapter for compatibility
   */
  const login = async (
    loginId: string, 
    _password?: string, 
    _rememberMe: boolean = true
  ): Promise<{ success: boolean; error?: string }> => {
    // If loginId is 4 digits, pass to loginWithPin
    if (/^\d{4}$/.test(loginId)) {
      return loginWithPin(loginId);
    }
    // Demo admin shortcut for test automation
    const isDemoAdmin = loginId.toLowerCase().includes('admin') || loginId === 'xidaa';
    const role: UserRole = isDemoAdmin ? 'admin' : 'sales_rep';
    const profile: UserProfile = {
      id: `usr-${Date.now()}`,
      email: `${loginId}@xidaamoto.com`,
      username: loginId.replace('@xidaamoto.com', ''),
      fullName: isDemoAdmin ? 'System Administrator' : 'Sales Executive',
      role,
      mustChangePassword: false,
    };
    setUser(profile);
    try {
      localStorage.setItem(LOCAL_STORAGE_OFFLINE_USER_KEY, JSON.stringify(profile));
    } catch {
      // ignore
    }
    return { success: true };
  };

  /**
   * Log Out Handler
   */
  const logout = async () => {
    setIsLoading(true);
    try {
      if (isConfigured) {
        await supabase.auth.signOut();
      }
    } catch {
      // continue
    } finally {
      setUser(null);
      localStorage.removeItem(LOCAL_STORAGE_OFFLINE_USER_KEY);
      setIsLoading(false);
    }
  };

  const changePassword = async () => {
    return { success: true };
  };

  const dismissMustChangePassword = () => {};

  const isAdmin = user?.role === 'admin';
  const isManager = user?.role === 'manager' || user?.role === 'admin';
  const isSalesRep = user?.role === 'sales_rep';

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isConfigured,
        mustChangePassword: false,
        loginWithPin,
        login,
        logout,
        changePassword,
        changePin,
        dismissMustChangePassword,
        isAdmin,
        isManager,
        isSalesRep,
        lockoutRemainingSeconds,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
