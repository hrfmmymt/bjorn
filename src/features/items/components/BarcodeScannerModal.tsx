import { useState, useRef } from "react";
import { BarcodeScanner } from "./BarcodeScanner";
import { fetchBookInfo } from "../services/bookApi";
import { fetchMusicInfo } from "../services/musicApi";
import { CgClose } from "react-icons/cg";

type BarcodeScannerModalProps = {
  isOpen: boolean;
  onScanComplete: (data: {
    title: string;
    author: string | null;
    image: string | null;
    format: string | null;
  }) => void;
  onClose: () => void;
};

export function BarcodeScannerModal({
  isOpen,
  onScanComplete,
  onClose,
}: BarcodeScannerModalProps) {
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const handleDetected = async (barcode: string) => {
    try {
      // 処理中の場合は重複スキャンを防止
      if (processing) return;

      setProcessing(true);
      setError(null);

      // スキャン成功音を再生
      if (audioRef.current) {
        audioRef.current.play();
      }

      let itemInfo: {
        title: string;
        author: string | null;
        image: string | null;
        format: string | null;
      };

      // ISBNの場合（13桁または10桁の数字）
      if (/^(\d{13}|\d{10})$/.test(barcode)) {
        itemInfo = await fetchBookInfo(barcode);
      }
      // UPCバーコードの場合（12桁の数字）
      else if (/^\d{12}$/.test(barcode)) {
        itemInfo = await fetchMusicInfo(barcode);
      } else {
        throw new Error("未対応のバーコード形式です");
      }

      // Web Audio APIを使用して「ピッ」を生成
      const audioContext = new (window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.type = "sine";
      oscillator.frequency.value = 1000; // 1000Hzの音
      gainNode.gain.value = 0.5; // 音量

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.start();
      setTimeout(() => oscillator.stop(), 100); // 再生時間0.1秒

      onScanComplete(itemInfo);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "不明なエラーが発生しました",
      );
    } finally {
      setProcessing(false);
    }
  };

  return (
    <dialog id="barcode_modal" className="modal">
      <div className="modal-box relative">
        <h3 className="font-bold text-lg mb-4">バーコードをスキャン</h3>
        <BarcodeScanner
          onDetected={handleDetected}
          onError={(err) => setError(err.message)}
          isActive={isOpen}
        />
        {error && (
          <div className="mt-4 p-2 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}
        <button
          className="absolute top-6 right-6"
          type="button"
          onClick={onClose}
        >
          <CgClose aria-label="ダイアログを閉じる" size={28} />
        </button>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button type="button" onClick={onClose}>
          ダイアログを閉じる
        </button>
      </form>
    </dialog>
  );
}
