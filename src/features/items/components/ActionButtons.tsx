import { HiPlus, HiQrcode } from "react-icons/hi";

type ActionButtonsProps = {
  onOpenAddModal: () => void;
  onOpenScannerModal: () => void;
};

export function ActionButtons({
  onOpenAddModal,
  onOpenScannerModal,
}: ActionButtonsProps) {
  return (
    <div className="flex gap-4 mb-8">
      <button
        type="button"
        className="flex items-center gap-4 bg-transparent hover:bg-blue-500 font-semibold hover:text-white p-4 border border-blue-500 hover:border-transparent rounded-full"
        onClick={onOpenAddModal}
      >
        <HiPlus size={20} aria-label="add new item" />
      </button>

      <button
        type="button"
        className="flex items-center gap-4 bg-transparent hover:bg-green-500 font-semibold hover:text-white p-4 border border-green-500 hover:border-transparent rounded-full"
        onClick={onOpenScannerModal}
      >
        <HiQrcode size={20} aria-label="scan barcode" />
      </button>
    </div>
  );
}
