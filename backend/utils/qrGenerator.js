const QRCode = require('qrcode');

// Generates a QR code as a base64 Data URL, encoding ONLY the safe public URL
const generateQRCode = async (publicUrl) => {
  try {
    const qrDataUrl = await QRCode.toDataURL(publicUrl, {
      errorCorrectionLevel: 'H',
      margin: 2,
      width: 400,
      color: {
        dark: '#0C1F1A',
        light: '#FFFFFF',
      },
    });
    return qrDataUrl;
  } catch (error) {
    throw new Error(`QR generation failed: ${error.message}`);
  }
};

module.exports = generateQRCode;