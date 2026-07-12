import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './QRDisplay.css';

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
      className="qr-display"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="qr-image-wrap">
        <img src={asset.qrCodeUrl} alt={`QR code for ${asset.assetCode}`} />
      </div>

      <div className="qr-label">
        <h4>{asset.name}</h4>
        <span className="qr-code-text">{asset.assetCode}</span>
        <span className="qr-location">{asset.location}</span>
      </div>

      <div className="qr-actions">
        <button className="qr-btn" onClick={handleDownload}>Download</button>
        <button className="qr-btn" onClick={handleCopyLink}>Copy Link</button>
        <a className="qr-btn qr-btn-primary" href={asset.publicUrl} target="_blank" rel="noreferrer">
          Open Public Page
        </a>
      </div>

      <AnimatePresence>
        {toast && (
          <motion.div
            className="qr-toast"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default QRDisplay;