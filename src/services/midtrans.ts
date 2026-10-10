declare global {
  interface Window {
    snap?: {
      pay: (
        snapToken: string,
        options?: {
          onSuccess?: (result: unknown) => void;
          onPending?: (result: unknown) => void;
          onError?: (result: unknown) => void;
          onClose?: () => void;
        },
      ) => void;
    };
  }
}

let snapLoadingPromise: Promise<void> | null = null;

export const loadMidtransSnap = (): Promise<void> => {
  if (window.snap) {
    return Promise.resolve();
  }

  if (snapLoadingPromise) {
    return snapLoadingPromise;
  }

  snapLoadingPromise = new Promise((resolve, reject) => {
    const clientKey = import.meta.env.VITE_MIDTRANS_CLIENT_KEY;

    if (!clientKey) {
      reject(new Error("VITE_MIDTRANS_CLIENT_KEY belum dikonfigurasi."));
      return;
    }

    const script = document.createElement("script");

    script.src = "https://app.sandbox.midtrans.com/snap/snap.js";

    script.setAttribute("data-client-key", clientKey);

    script.async = true;

    script.onload = () => resolve();

    script.onerror = () => {
      snapLoadingPromise = null;
      reject(new Error("Gagal memuat Midtrans Snap."));
    };

    document.head.appendChild(script);
  });

  return snapLoadingPromise;
};
