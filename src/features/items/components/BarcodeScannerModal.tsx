import { useState } from "react";
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
  }) => void;
  onClose: () => void;
};

export function BarcodeScannerModal({
  isOpen,
  onScanComplete,
  onClose,
}: BarcodeScannerModalProps) {
  const [error, setError] = useState<string | null>(null);

  const handleDetected = async (barcode: string) => {
    try {
      setError(null);
      let itemInfo;

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

      onScanComplete(itemInfo);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "不明なエラーが発生しました",
      );
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
        <button>ダイアログを閉じる</button>
      </form>
    </dialog>
  );
}
