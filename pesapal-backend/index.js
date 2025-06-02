const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const PESA_PAL_API = process.env.PESAPAL_ENV === 'production'
  ? 'https://pay.pesapal.com/v3/api'
  : 'https://demo.pesapal.com/api'; // Use demo for testing
const CONSUMER_KEY = process.env.PESAPAL_CONSUMER_KEY;
const CONSUMER_SECRET = process.env.PESAPAL_CONSUMER_SECRET;
const CALLBACK_URL = process.env.CALLBACK_URL || 'https://your-site.com/payment-callback';

// Get OAuth Token
async function getPesaPalToken() {
  try {
    const response = await axios.post(`${PESA_PAL_API}/Auth/RequestToken`, {
      consumer_key: CONSUMER_KEY,
      consumer_secret: CONSUMER_SECRET,
    });
    return response.data.token;
  } catch (error) {
    console.error('Error getting PesaPal token:', error.response?.data || error.message);
    throw new Error('Failed to authenticate with PesaPal');
  }
}

// Register IPN (Optional, do this once in PesaPal dashboard or via API)
async function registerIPN(token) {
  try {
    const response = await axios.post(
      `${PESA_PAL_API}/URLSetup/RegisterIPN`,
      {
        url: CALLBACK_URL,
        ipn_notification_type: 'GET', // PesaPal supports GET or POST
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data.ipn_id;
  } catch (error) {
    console.error('Error registering IPN:', error.response?.data || error.message);
    throw new Error('Failed to register IPN');
  }
}

// Submit Payment Order
app.post('/api/initiate-payment', async (req, res) => {
  const { amount, currency, description, email, phone, packageName } = req.body;

  if (!amount || !email || !phone) {
    return res.status(400).json({ error: 'Amount, email, and phone are required' });
  }

  try {
    const token = await getPesaPalToken();
    // Optionally register IPN (run this once or check if already registered)
    // const ipnId = await registerIPN(token);

    const orderData = {
      id: `ORDER-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, // Unique order ID
      currency: currency || 'UGX',
      amount: parseFloat(amount), // Ensure amount is a number
      description: description || `Payment for ${packageName}`,
      callback_url: CALLBACK_URL,
      notification_id: process.env.PESAPAL_IPN_ID, // Set in .env after registering IPN
      billing_address: {
        email_address: email,
        phone_number: phone,
      },
    };

    const response = await axios.post(
      `${PESA_PAL_API}/Transactions/SubmitOrderRequest`,
      orderData,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    res.json({ iframeUrl: response.data.redirect_url });
  } catch (error) {
    console.error('Payment initiation error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to initiate payment' });
  }
});

// Payment Callback (IPN)
app.get('/payment-callback', async (req, res) => {
  const { orderTrackingId, status } = req.query;
  console.log(`Payment status for ${orderTrackingId}: ${status}`);
  // TODO: Update order status in your database
  if (status === 'COMPLETED') {
    res.redirect('http://localhost:3000/payment-success');
  } else {
    res.redirect('http://localhost:3000/payment-failed');
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));