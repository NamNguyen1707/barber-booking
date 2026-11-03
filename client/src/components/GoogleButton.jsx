import { useEffect, useRef } from 'react';

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const SRC = 'https://accounts.google.com/gsi/client';

function loadScript() {
  return new Promise((resolve, reject) => {
    if (window.google?.accounts?.id) return resolve();
    let s = document.querySelector(`script[src="${SRC}"]`);
    if (!s) {
      s = document.createElement('script');
      s.src = SRC;
      s.async = true;
      document.head.appendChild(s);
    }
    s.addEventListener('load', resolve);
    s.addEventListener('error', reject);
  });
}

// Nút "Tiếp tục với Google". Chỉ hiện khi đã cấu hình VITE_GOOGLE_CLIENT_ID.
export default function GoogleButton({ onCredential, text = 'continue_with' }) {
  const box = useRef(null);
  const cb = useRef(onCredential);
  cb.current = onCredential;

  useEffect(() => {
    if (!CLIENT_ID) return;
    let cancelled = false;
    loadScript()
      .then(() => {
        if (cancelled || !box.current) return;
        window.google.accounts.id.initialize({
          client_id: CLIENT_ID,
          callback: (res) => cb.current?.(res.credential),
        });
        window.google.accounts.id.renderButton(box.current, {
          theme: 'outline',
          size: 'large',
          text,
          shape: 'rectangular',
          width: 320,
        });
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [text]);

  if (!CLIENT_ID) return null;
  return (
    <div>
      <div className="my-4 flex items-center gap-3 text-xs uppercase tracking-widest text-ink/40">
        <span className="h-px flex-1 bg-coffee/15" /> hoặc <span className="h-px flex-1 bg-coffee/15" />
      </div>
      <div ref={box} className="flex justify-center" />
    </div>
  );
}
