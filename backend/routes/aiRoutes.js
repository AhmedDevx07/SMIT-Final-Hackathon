const express = require('express');
const router = express.Router();
const { triageIssue } = require('../controllers/aiController');

// Triage is reachable without login since the public reporter needs it too.
// The OpenAI key stays server-side regardless — never exposed to the client.
router.post('/triage', triageIssue);

module.exports = router;