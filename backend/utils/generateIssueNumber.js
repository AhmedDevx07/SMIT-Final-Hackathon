const Issue = require('../models/Issue');

// Generates a unique issue number like ISS-0001
const generateIssueNumber = async () => {
  const count = await Issue.countDocuments();
  const nextNumber = count + 1;
  const padded = String(nextNumber).padStart(4, '0');
  let code = `ISS-${padded}`;

  let exists = await Issue.findOne({ issueNumber: code });
  let attempt = nextNumber;
  while (exists) {
    attempt += 1;
    code = `ISS-${String(attempt).padStart(4, '0')}`;
    exists = await Issue.findOne({ issueNumber: code });
  }

  return code;
};

module.exports = generateIssueNumber;