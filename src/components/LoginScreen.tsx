import React, { useState, useEffect, useCallback } from 'react';
import { 
  Delete, 
  Sparkles, 
  ShieldCheck, 
  AlertCircle,
  Clock,
  KeyRound
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LoginScreen: React.FC = () => {
  const { loginWithPin, lockoutRemainingSeconds } = useAuth();
  const [pin, setPin] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [shake, setShake] = useState<boolean>(false);

  const isLocked = lockoutRemainingSeconds > 0;

  // Handle PIN verification when 4 digits are reached
  const handleVerifyPin = useCallback(async (pinToVerify: string) => {
    if (isVerifying || isLocked) return;
    setIsVerifying(true);
    setErrorMessage(null);

    const res = await loginWithPin(pinToVerify);
    setIsVerifying(false);

    if (!res.success) {
      setShake(true);
      setErrorMessage(res.error || 'Incorrect PIN. Please try again.');
      setPin('');
      setTimeout(() => setShake(false), 500);
    }
  }, [loginWithPin, isVerifying, isLocked]);

  // Handle digit press
  const handleDigitPress = (digit: string) => {
    if (isLocked || isVerifying || pin.length >= 4) return;
    setErrorMessage(null);
    const newPin = pin + digit;
    setPin(newPin);

    if (newPin.length === 4) {
      handleVerifyPin(newPin);
    }
  };

  // Handle backspace
  const handleBackspace = () => {
    if (isLocked || isVerifying) return;
    setPin(prev => prev.slice(0, -1));
    setErrorMessage(null);
  };

  // Handle clear
  const handleClear = () => {
    if (isLocked || isVerifying) return;
    setPin('');
    setErrorMessage(null);
  };

  // Quick fill helper for convenience
  const handleQuickFill = (presetPin: string) => {
    if (isLocked || isVerifying) return;
    setPin(presetPin);
    handleVerifyPin(presetPin);
  };

  // Physical keyboard support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isLocked || isVerifying) return;

      if (/^[0-9]$/.test(e.key)) {
        e.preventDefault();
        setPin(prev => {
          if (prev.length >= 4) return prev;
          const next = prev + e.key;
          if (next.length === 4) {
            handleVerifyPin(next);
          }
          return next;
        });
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        setPin(prev => prev.slice(0, -1));
        setErrorMessage(null);
      } else if (e.key === 'Escape' || e.key === 'c' || e.key === 'C') {
        setPin('');
        setErrorMessage(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLocked, isVerifying, handleVerifyPin]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] aura-trio flex flex-col justify-center items-center px-4 py-8 select-none relative overflow-hidden">
      
      {/* Brand Header */}
      <div className="max-w-xs w-full text-center space-y-4 mb-6">
        <div className="flex justify-center">
          <div className="p-3.5 bg-white rounded-2xl shadow-sm border border-slate-200/90 inline-block">
            <img 
              src="/assets/xidaa-logo-dark.png" 
              alt="Xidaa Moto" 
              className="h-10 sm:h-11 w-auto object-contain"
            />
          </div>
        </div>

        <div>
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-pink-50 via-blue-50 to-emerald-50 border border-slate-200 text-[10px] font-black uppercase tracking-wider mb-2">
            <span className="w-2 h-2 rounded-full bg-pink-500 animate-pulse" />
            <span className="text-slate-800">Commercial Sales Terminal</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Xidaa Discount Calculator
          </h1>
          <p className="text-xs font-medium text-slate-500 mt-1">
            B2B Commercial Quotation & Fleet Logistics Portal
          </p>
        </div>
      </div>

      {/* PIN Card */}
      <div className="max-w-xs w-full bg-white/95 backdrop-blur-xl rounded-3xl p-6 sm:p-7 shadow-xl shadow-slate-200/50 border border-slate-200/90 space-y-5 text-center relative">
        
        {/* Trio Accent Bar on Top */}
        <div className="h-1 w-20 mx-auto rounded-full bg-gradient-to-r from-pink-500 via-blue-500 to-emerald-500 -mt-1" />

        {/* Title & Instructions */}
        <div className="space-y-1">
          <div className="w-10 h-10 rounded-2xl bg-pink-50 text-pink-600 flex items-center justify-center mx-auto border border-pink-100 shadow-2xs">
            <KeyRound className="w-5 h-5" />
          </div>
          <h2 className="text-sm font-bold text-slate-900">
            Enter Security PIN
          </h2>
          <p className="text-xs text-slate-400">
            4-digit numeric code to unlock terminal
          </p>
        </div>

        {/* 4 Visual PIN Indicators (Dots) */}
        <div className={`flex items-center justify-center space-x-4 py-2 ${shake ? 'animate-bounce' : ''}`}>
          {[0, 1, 2, 3].map((index) => {
            const isFilled = pin.length > index;
            return (
              <div
                key={index}
                data-testid="pin-dot"
                className={`w-4 h-4 rounded-full transition-all duration-150 ${
                  isFilled
                    ? 'bg-gradient-to-br from-pink-500 to-rose-600 scale-115 shadow-sm shadow-pink-500/30 ring-4 ring-pink-100'
                    : 'bg-slate-200 border border-slate-300'
                }`}
              />
            );
          })}
        </div>

        {/* Lockout or Error Alerts */}
        {isLocked ? (
          <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-center justify-center space-x-1.5 animate-fade-in">
            <Clock className="w-3.5 h-3.5 text-amber-700 flex-shrink-0 animate-pulse" />
            <span>Keypad locked: wait <strong>{lockoutRemainingSeconds}s</strong></span>
          </div>
        ) : errorMessage ? (
          <div className="p-2.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center justify-center space-x-1.5 animate-fade-in">
            <AlertCircle className="w-3.5 h-3.5 text-red-600 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        ) : (
          <div className="h-7 text-xs text-slate-400 flex items-center justify-center">
            {isVerifying ? (
              <span className="text-pink-600 font-semibold flex items-center space-x-1">
                <Sparkles className="w-3 h-3 animate-spin" />
                <span>Verifying credentials...</span>
              </span>
            ) : (
              <span>Touch keypad or use physical keyboard</span>
            )}
          </div>
        )}

        {/* Numeric Keypad (0–9, Clear, Backspace) */}
        <div className="grid grid-cols-3 gap-2.5 pt-1">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
            <button
              key={digit}
              type="button"
              disabled={isLocked || isVerifying}
              onClick={() => handleDigitPress(digit)}
              className="h-12 sm:h-13 rounded-2xl bg-slate-50/80 hover:bg-pink-50/60 active:bg-pink-100/70 border border-slate-200/90 text-lg font-bold font-mono text-slate-900 hover:text-pink-700 hover:border-pink-200 flex items-center justify-center transition-all cursor-pointer active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed shadow-2xs"
            >
              {digit}
            </button>
          ))}

          {/* Clear Button */}
          <button
            type="button"
            disabled={isLocked || isVerifying || pin.length === 0}
            onClick={handleClear}
            className="h-12 sm:h-13 rounded-2xl bg-slate-50 hover:bg-slate-100 text-xs font-bold text-slate-500 flex items-center justify-center transition-all cursor-pointer active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed border border-slate-200/70"
          >
            Clear
          </button>

          {/* Digit 0 */}
          <button
            type="button"
            disabled={isLocked || isVerifying}
            onClick={() => handleDigitPress('0')}
            className="h-12 sm:h-13 rounded-2xl bg-slate-50/80 hover:bg-pink-50/60 active:bg-pink-100/70 border border-slate-200/90 text-lg font-bold font-mono text-slate-900 hover:text-pink-700 hover:border-pink-200 flex items-center justify-center transition-all cursor-pointer active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed shadow-2xs"
          >
            0
          </button>

          {/* Backspace Button */}
          <button
            type="button"
            disabled={isLocked || isVerifying || pin.length === 0}
            onClick={handleBackspace}
            aria-label="Backspace"
            className="h-12 sm:h-13 rounded-2xl bg-slate-50 hover:bg-slate-100 text-slate-700 flex items-center justify-center transition-all cursor-pointer active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed border border-slate-200/70"
          >
            <Delete className="w-5 h-5 text-slate-600" />
          </button>
        </div>

        {/* Quick Access PIN Presets */}
        <div className="pt-3 border-t border-slate-100 space-y-1.5 text-center">
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
            Authorized Initial Roles:
          </span>
          <div className="flex items-center justify-center space-x-2">
            <button
              type="button"
              onClick={() => handleQuickFill('9999')}
              className="py-1 px-3 rounded-xl text-[11px] font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-all cursor-pointer active:scale-95"
            >
              Standard (9999)
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('2026')}
              className="py-1 px-3 rounded-xl text-[11px] font-bold text-pink-700 bg-pink-50 hover:bg-pink-100 border border-pink-200 transition-all cursor-pointer active:scale-95"
            >
              Admin (2026)
            </button>
          </div>
        </div>

      </div>

      {/* Security Footer Note */}
      <div className="mt-6 text-center text-xs text-slate-400 space-y-1">
        <div className="flex items-center justify-center space-x-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Encrypted cryptographic session authentication</span>
        </div>
        <p className="text-[10px] text-slate-400">
          Xidaa Moto Private Limited • Dealership Commercial Gateway
        </p>
      </div>

    </div>
  );
};
