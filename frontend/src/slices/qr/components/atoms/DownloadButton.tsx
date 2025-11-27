/**
 * Download Button Atom Component
 * Button for downloading QR code as image
 */

interface DownloadButtonProps {
  onClick: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary';
  label?: string;
  'data-testid'?: string;
}

export function DownloadButton({
  onClick,
  disabled = false,
  variant = 'primary',
  label = 'Download QR',
  'data-testid': testId
}: DownloadButtonProps) {
  const baseClasses = "flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2";

  const variantClasses = {
    primary: "bg-vitalgo-green text-white hover:bg-vitalgo-green/90 focus:ring-vitalgo-green disabled:bg-gray-300 disabled:cursor-not-allowed",
    secondary: "bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-gray-500 disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed"
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses[variant]}`}
      data-testid={testId}
    >
      <svg
        className="w-4 h-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
      {label}
    </button>
  );
}