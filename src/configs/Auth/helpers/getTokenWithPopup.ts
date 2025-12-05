import { openPopupWindow } from '../utils/functions';

// Use in client side only
export default function getTokenWithPopup(): Promise<string> | undefined {
  if (typeof window === 'undefined') return;
  let timer: NodeJS.Timeout;
  const abortController = new AbortController();
  const newWindow = openPopupWindow(`${process.env.NEXT_PUBLIC_APP_URL}/api/auth/login`, 'Login', window);

  // Return undefined if popup window is not opened
  if (!newWindow) return;

  return new Promise<string>((resolve) => {
    // Set a timer to check if the popup is closed by user
    timer = setInterval(() => {
      if (newWindow.closed) {
        clearInterval(timer);
        abortController.abort();
        resolve(undefined);
      }
    }, 1000);

    window.addEventListener(
      'storage',
      (e) => {
        if (e.key !== 'token') return;
        resolve(e.newValue);
      },
      {
        signal: abortController.signal,
      }
    );
  })
    .then((token) => {
      clearInterval(timer);
      newWindow.close();
      return token;
    })
    .finally(() => {
      abortController.abort();
    });
}
