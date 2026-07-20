import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const QRDisplay = ({ asset }) => {
  const [toast, setToast] = useState(null);

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 2000);
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = asset.qrCodeUrl;
    link.download = `${asset.assetCode}-qr.png`;
    link.click();
    showToast('QR code downloaded ✓');
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(asset.publicUrl);
    showToast('Link copied to clipboard ✓');
  };

  return (
    <motion.div
      className="relative w-full max-w-[320px] overflow-hidden rounded-2xl border border-white/[0.08] bg-gray-900 p-8 text-center shadow-xl backdrop-blur-md"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Top Gradient Accent Bar */}
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-indigo-500 to-violet-500" />

      {/* QR Image Frame */}
      <div className="inline-block p-4 mb-5 bg-white rounded-xl shadow-[0_0_20px_rgba(255,255,255,0.05)]">
        <img 
          className="w-[200px] h-[200px] block object-contain" 
          src={asset.qrCodeUrl} 
          alt={`QR code for ${asset.assetCode}`} 
        />
      </div>

      {/* Labels */}
      <div className="mb-6">
        <h4 className="text-lg font-semibold text-white mb-1.5">{asset.name}</h4>
        <span className="block text-indigo-400 font-bold tracking-wider text-sm font-mono mb-1">
          {asset.assetCode}
        </span>
        <span className="block text-gray-400 text-xs sm:text-sm">
          {asset.location}
        </span>
      </div>

      {/* Actions Stack */}
      <div className="flex flex-col gap-3">
        <button 
          className="cursor-pointer rounded-xl border border-white/[0.08] p-3 text-sm font-medium text-white transition-colors hover:bg-white/[0.04]" 
          onClick={handleDownload}
        >
          Download
        </button>
        <button 
          className="cursor-pointer rounded-xl border border-white/[0.08] p-3 text-sm font-medium text-white transition-colors hover:bg-white/[0.04]" 
          onClick={handleCopyLink}
        >
          Copy Link
        </button>
        <a 
          className="cursor-pointer rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 p-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 hover:from-indigo-500 hover:to-violet-500 hover:shadow-indigo-500/30 transition-all hover:-translate-y-0.5 text-center" 
          href={asset.publicUrl} 
          target="_blank" 
          rel="noreferrer"
        >
          Open Public Page
        </a>
      </div>

      {/* Action Notification Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            className="absolute bottom-5 left-1/2 -translate-x-1/2 rounded-full bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-indigo-500/40 whitespace-nowrap"
            initial={{ opacity: 0, y: 10, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 10, x: '-50%' }}
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default QRDisplay;