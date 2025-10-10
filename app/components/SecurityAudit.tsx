import React, { useEffect, useState } from 'react';
import { SecurityUtils } from '../config/security';

interface SecurityStatus {
  isSecureContext: boolean;
  hasHttps: boolean;
  hasValidCSP: boolean;
  hasLocalStorage: boolean;
  hasSessionStorage: boolean;
  hasCookies: boolean;
  userAgent: string;
  timestamp: Date;
}

export const SecurityAudit: React.FC = () => {
  const [securityStatus, setSecurityStatus] = useState<SecurityStatus | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const checkSecurityStatus = () => {
      const status: SecurityStatus = {
        ...SecurityUtils.getSecurityStatus(),
        hasLocalStorage: typeof localStorage !== 'undefined',
        hasSessionStorage: typeof sessionStorage !== 'undefined',
        hasCookies: navigator.cookieEnabled,
        userAgent: navigator.userAgent,
        timestamp: new Date(),
      };

      setSecurityStatus(status);

      // Log security issues
      if (!status.isSecureContext) {
        console.warn('⚠️ Security: Not running in secure context');
      }
      if (!status.hasHttps) {
        console.warn('⚠️ Security: Not using HTTPS');
      }
      if (!status.hasValidCSP) {
        console.warn('⚠️ Security: Content Security Policy not detected');
      }
    };

    checkSecurityStatus();
    const interval = setInterval(checkSecurityStatus, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, []);

  if (!securityStatus) return null;

  const securityScore = [
    securityStatus.isSecureContext,
    securityStatus.hasHttps,
    securityStatus.hasValidCSP,
    securityStatus.hasLocalStorage,
    securityStatus.hasSessionStorage,
    securityStatus.hasCookies,
  ].filter(Boolean).length;

  const maxScore = 6;
  const percentage = Math.round((securityScore / maxScore) * 100);

  return (
    <div className="fixed bottom-4 left-4 z-50">
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg shadow-lg transition-colors"
        title="Security Audit"
      >
        🔒 {percentage}%
      </button>

      {isVisible && (
        <div className="absolute bottom-12 left-0 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-xl p-4 w-80 max-h-96 overflow-y-auto">
          <h3 className="text-lg font-bold mb-3 text-gray-900 dark:text-white">
            Security Audit Report
          </h3>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-300">Secure Context:</span>
              <span className={securityStatus.isSecureContext ? 'text-green-600' : 'text-red-600'}>
                {securityStatus.isSecureContext ? '✅' : '❌'}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-300">HTTPS:</span>
              <span className={securityStatus.hasHttps ? 'text-green-600' : 'text-red-600'}>
                {securityStatus.hasHttps ? '✅' : '❌'}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-300">CSP:</span>
              <span className={securityStatus.hasValidCSP ? 'text-green-600' : 'text-red-600'}>
                {securityStatus.hasValidCSP ? '✅' : '❌'}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-300">Local Storage:</span>
              <span className={securityStatus.hasLocalStorage ? 'text-green-600' : 'text-red-600'}>
                {securityStatus.hasLocalStorage ? '✅' : '❌'}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-300">Session Storage:</span>
              <span className={securityStatus.hasSessionStorage ? 'text-green-600' : 'text-red-600'}>
                {securityStatus.hasSessionStorage ? '✅' : '❌'}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-300">Cookies:</span>
              <span className={securityStatus.hasCookies ? 'text-green-600' : 'text-red-600'}>
                {securityStatus.hasCookies ? '✅' : '❌'}
              </span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-600">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-300">Security Score:</span>
              <span className={`text-lg font-bold ${
                percentage >= 80 ? 'text-green-600' : 
                percentage >= 60 ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {percentage}%
              </span>
            </div>
            
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-2">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${
                  percentage >= 80 ? 'bg-green-600' : 
                  percentage >= 60 ? 'bg-yellow-600' : 'bg-red-600'
                }`}
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>

          <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
            Last updated: {securityStatus.timestamp.toLocaleTimeString()}
          </div>
        </div>
      )}
    </div>
  );
};

export default SecurityAudit;
