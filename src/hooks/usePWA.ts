'use client';

import { useEffect } from 'react';

export function PWAInstallPrompt() {
  useEffect(() => {
    // Register Service Worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('SW registered:', registration.scope);
          
          // Check for updates periodically
          setInterval(() => {
            registration.update();
          }, 60 * 60 * 1000); // Every hour
        })
        .catch((error) => {
          console.log('SW registration failed:', error);
        });
    }

    // Handle PWA install prompt
    let deferredPrompt: any = null;

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      deferredPrompt = e;
      showInstallButton();
    };

    const handleAppInstalled = () => {
      deferredPrompt = null;
      hideInstallButton();
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Check if already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    
    if (!isStandalone && !isIOS) {
      // Show install hint after 30 seconds
      setTimeout(showInstallButton, 30000);
    }

    function showInstallButton() {
      if (document.getElementById('pwa-install-banner')) return;
      if (deferredPrompt || isIOS) {
        const banner = document.createElement('div');
        banner.id = 'pwa-install-banner';
        banner.className = 'fixed bottom-24 left-4 right-4 md:left-auto md:right-4 md:w-80 z-50 animate-slide-up';
        banner.innerHTML = `
          <div class="bg-amber-950 rounded-xl border border-amber-200 shadow-xl p-4">
            <div class="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center">
                <span className="text-white text-xl">📱</span>
              </div>
              <div>
                <p className="font-semibold text-amber-100">Instalar App</p>
                <p className="text-sm text-amber-200">Acceso rápido desde tu pantalla de inicio</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button id="pwa-install-btn" className="flex-1 px-4 py-2 bg-amber-500 text-amber-950 rounded-lg font-medium hover:bg-amber-600">
                Instalar
              </button>
              <button id="pwa-dismiss-btn" className="px-4 py-2 border border-amber-300 text-amber-300 rounded-lg font-medium hover:bg-amber-50">
                Luego
              </button>
            </div>
          </div>
        `;
        document.body.appendChild(banner);

        document.getElementById('pwa-install-btn')?.addEventListener('click', async () => {
          if (deferredPrompt) {
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            if (outcome === 'accepted') {
              deferredPrompt = null;
            }
          }
          hideInstallButton();
        });

        document.getElementById('pwa-dismiss-btn')?.addEventListener('click', () => {
          hideInstallButton();
          // Don't show again for 24 hours
          localStorage.setItem('pwa-dismissed', Date.now().toString());
        });
      }
    }

    function hideInstallButton() {
      const banner = document.getElementById('pwa-install-banner');
      if (banner) banner.remove();
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      hideInstallButton();
    };
  }, []);

  return null;
}

// Hook for push notifications
export function usePushNotifications() {
  const requestPermission = async () => {
    if (!('Notification' in window)) return false;
    
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  };

  const subscribe = async () => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return null;
    
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(
        process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || ''
      ),
    });
    
    return subscription;
  };

  return { requestPermission, subscribe };
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  
  return outputArray;
}

// Hook for background sync
export function useBackgroundSync() {
  const registerSync = async (tag: string) => {
    if (!('serviceWorker' in navigator) || !('SyncManager' in window)) return;
    
    const registration = await navigator.serviceWorker.ready;
    // Type assertion for background sync API
    const syncRegistration = registration as any;
    if (syncRegistration.sync) {
      await syncRegistration.sync.register(tag);
    }
  };

  return { registerSync };
}
