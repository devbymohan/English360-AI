/**
 * Browser and device detection utilities for mobile Google Sign-In support.
 */

export const isMobileBrowser = () => {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent || navigator.vendor || window.opera || '';

  // Touch screen capability check (includes iPadOS which presents desktop Safari UA)
  const isTouchScreen = Boolean(
    ('ontouchstart' in window) ||
    (navigator.maxTouchPoints && navigator.maxTouchPoints > 0)
  );

  const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|mobile|CriOS/i;
  return mobileRegex.test(ua) || (isTouchScreen && window.innerWidth <= 1024);
};

export const isInAppBrowser = () => {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent || navigator.vendor || window.opera || '';
  // Detect WebViews from Facebook, Instagram, WhatsApp, Line, Twitter/X, Telegram, WeChat
  return /FBAN|FBAV|Instagram|Line|Twitter|MicroMessenger|WhatsApp|Snapchat|Telegram/i.test(ua);
};
