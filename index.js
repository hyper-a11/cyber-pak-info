const express = require('express');
const axios = require('axios');
const { DateTime } = require('luxon');

const app = express();
const PORT = process.env.PORT || 3000;
const OWNER_NAME = "ZEXX_OWNER";

// 🔑 Multiple Keys Database
const KEYS_DB = {
  "ZEXX@_VIP": { expiry: "2026-12-31", status: "Premium" },
  "OWNER_TEST": { expiry: "2035-12-30", status: "Trial" },
  "ZEXX_@TRY": { expiry: "2026-04-15", status: "Basic" },
  "ZEXX_P@ID": { expiry: "2026-07-01", status: "Premium" }
};

// Middleware for parsing JSON requests
app.use(express.json());

// Search Endpoint
app.get('/search', async (req, res) => {
  const { phone, key } = req.query;

  // 1️⃣ Key Validation
  if (!key || !KEYS_DB[key]) {
    return res.status(401).json({ success: false, message: 'Invalid Key!', owner: OWNER_NAME });
  }

  // 2️⃣ Expiry Check
  const today = DateTime.local();
  const expiryDate = DateTime.fromISO(KEYS_DB[key].expiry);
  const daysLeft = expiryDate.diff(today, 'days').toObject().days;

  if (today > expiryDate) {
    return res.status(403).json({
      success: false,
      message: 'Key Expired!',
      expiry_date: KEYS_DB[key].expiry,
      owner: OWNER_NAME
    });
  }

  // 3️⃣ Phone Check
  if (!phone) {
    return res.status(400).json({ success: false, message: 'PakPhone number parameter required', owner: OWNER_NAME });
  }

  try {
    // 🔥 External API Call (Phone Number Info API)
    const response = await axios.get('https://fam-official.serv00.net/api/database.php', {
      params: {
        number: Pakphone
      },
      timeout: 10000 // Timeout set to 10 seconds
    });

    const apiData = response.data;

    // 🔥 Owner Replace Fix
    if (apiData && apiData.credit) {
      apiData.credit = 'CYBER×CHAT';
    }

    return res.json({
      success: true,
      owner: OWNER_NAME,
      data: apiData || {}
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'External API Error',
      error: error.message,
      owner: OWNER_NAME
    });
  }
});

// Home Route
app.get('/', (req, res) => {
  res.json({
    message: 'API Running Successfully 🚀',
    owner: OWNER_NAME
  });
});

// Serverless entry-point for Vercel
module.exports = app;
