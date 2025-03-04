import { BrowserMultiFormatReader, Exception } from "@zxing/library";
import { useEffect, useRef } from "react";

type BarcodeScannerProps = {
  onDetected: (result: string) => void;
  onError: (error: Error) => void;
  isActive: boolean;
};

export function BarcodeScanner({
  onDetected,
  onError,
  isActive,
}: BarcodeScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!isActive) return;

    const codeReader = new BrowserMultiFormatReader();

    const startScanning = async () => {
      try {
        const videoInputDevices = await codeReader.listVideoInputDevices();
        if (videoInputDevices.length === 0) {
          throw new Error("カメラが見つかりません");
        }

        if (!videoRef.current) {
          throw new Error("ビデオ要素が見つかりません");
        }

        await codeReader.decodeFromVideoDevice(
          null,
          videoRef.current,
          (result, error) => {
            if (result) {
              onDetected(result.getText());
            }
            if (error && !(error instanceof Exception)) {
              console.error(error);
            }
          }
        );
      } catch (error) {
        if (!(error instanceof Exception)) {
          onError(error as Error);
        }
      }
    };

    startScanning();

    return () => {
      codeReader.reset();
    };
  }, [isActive, onDetected, onError]);

  return (
    <div className="relative">
      <video
        ref={videoRef}
        className="w-full"
        aria-label="バーコードスキャナー"
      />
    </div>
  );
}
