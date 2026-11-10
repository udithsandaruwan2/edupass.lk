import React, { useEffect, useRef, useState } from 'react';
import { Camera, CameraOff } from 'lucide-react';
import { Button } from './ui/Button';

type BarcodeDetectorLike = {
  detect: (source: ImageBitmapSource) => Promise<{ rawValue: string }[]>;
};

function getBarcodeDetector():
  | (new (opts?: { formats?: string[] }) => BarcodeDetectorLike)
  | null {
  const ctor = (window as unknown as { BarcodeDetector?: new (opts?: { formats?: string[] }) => BarcodeDetectorLike })
    .BarcodeDetector;
  return ctor ?? null;
}

/** Camera QR via BarcodeDetector when the browser supports it; otherwise a clear fallback. */
export const CameraQrScanner: React.FC<{
  onCode: (code: string) => void;
  active?: boolean;
}> = ({ onCode, active = true }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [supported, setSupported] = useState<boolean | null>(null);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const lastCode = useRef('');

  useEffect(() => {
    setSupported(Boolean(getBarcodeDetector() && navigator.mediaDevices?.getUserMedia));
  }, []);

  useEffect(() => {
    if (!active || !running || !supported) return;

    let stream: MediaStream | null = null;
    let raf = 0;
    let cancelled = false;
    const Detector = getBarcodeDetector();
    if (!Detector) return;

    const detector = new Detector({ formats: ['qr_code'] });

    const tick = async () => {
      const video = videoRef.current;
      if (!cancelled && video && video.readyState >= 2) {
        try {
          const codes = await detector.detect(video);
          const value = codes[0]?.rawValue?.trim();
          if (value && value !== lastCode.current) {
            lastCode.current = value;
            onCode(value);
          }
        } catch {
          /* frame decode can fail transiently */
        }
      }
      if (!cancelled) raf = window.setTimeout(() => void tick(), 250);
    };

    void (async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' } },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        const video = videoRef.current;
        if (video) {
          video.srcObject = stream;
          await video.play();
        }
        void tick();
      } catch {
        setError('Camera permission denied or unavailable.');
        setRunning(false);
      }
    })();

    return () => {
      cancelled = true;
      window.clearTimeout(raf);
      stream?.getTracks().forEach((t) => t.stop());
      if (videoRef.current) videoRef.current.srcObject = null;
    };
  }, [active, running, supported, onCode]);

  if (supported === false) {
    return (
      <div className="flex aspect-[2/1] max-h-56 w-full flex-col items-center justify-center rounded-md border-2 border-dashed border-line bg-surface-2/50 text-center">
        <CameraOff className="size-10 text-muted" aria-hidden="true" />
        <p className="mt-2 text-sm font-semibold text-fg">Camera QR not supported here</p>
        <p className="max-w-xs text-xs text-muted">Use type-in or simulate scan. Chrome/Edge on HTTPS usually support live QR.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="relative flex aspect-[2/1] max-h-56 w-full items-center justify-center overflow-hidden rounded-md border-2 border-dashed border-line bg-surface-2/50">
        {running ? (
          <video ref={videoRef} className="h-full w-full object-cover" muted playsInline />
        ) : (
          <div className="text-center">
            <Camera className="mx-auto size-10 text-brand" aria-hidden="true" />
            <p className="mt-2 text-sm font-semibold text-fg">Camera QR ready</p>
            <p className="max-w-xs text-xs text-muted">Start the camera to scan ticket QR codes.</p>
          </div>
        )}
      </div>
      {error && <p className="text-sm text-danger">{error}</p>}
      <Button
        type="button"
        variant="secondary"
        onClick={() => {
          setError(null);
          lastCode.current = '';
          setRunning((r) => !r);
        }}
      >
        {running ? 'Stop camera' : 'Start camera'}
      </Button>
    </div>
  );
};
