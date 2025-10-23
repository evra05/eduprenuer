const express = require('express');
const { 
  createSubscription, 
  getSubscriptionStatus, 
  cancelSubscription,
  handleWebhook
} = require('../controllers/subscriptionController');
const auth = require('../middleware/simpleAuth');

const router = express.Router();

// Webhook route (no auth required)
// @route   POST /api/subscriptions/webhook
// @desc    Handle Stripe webhooks
// @access  Public (but verified by Stripe signature)
router.post('/webhook', express.raw({ type: 'application/json' }), handleWebhook);

// All other routes require authentication
router.use(auth);

// @route   POST /api/subscriptions/create
// @desc    Create a new subscription
// @access  Private
router.post('/create', createSubscription);

// @route   GET /api/subscriptions/status
// @desc    Get subscription status
// @access  Private
router.get('/status', getSubscriptionStatus);

// @route   POST /api/subscriptions/cancel
// @desc    Cancel subscription
// @access  Private
router.post('/cancel', cancelSubscription);

module.exports = router;
