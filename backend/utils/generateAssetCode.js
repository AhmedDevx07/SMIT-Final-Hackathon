const Asset = require('../models/Asset');

// Generates a unique, human-readable asset code like AST-0001
const generateAssetCode = async () => {
  const count = await Asset.countDocuments();
  const nextNumber = count + 1;
  const padded = String(nextNumber).padStart(4, '0');
  let code = `AST-${padded}`;

  // Safety loop in case of deletions causing collisions
  let exists = await Asset.findOne({ assetCode: code });
  let attempt = nextNumber;
  while (exists) {
    attempt += 1;
    code = `AST-${String(attempt).padStart(4, '0')}`;
    exists = await Asset.findOne({ assetCode: code });
  }

  return code;
};

module.exports = generateAssetCode;