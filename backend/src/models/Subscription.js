const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  planType: { 
    type: String, 
    enum: ['solo', 'family', 'school'], 
    required: true 
  },
  stripeSubscriptionId: String,
  status: { 
    type: String, 
    enum: ['active', 'past_due', 'cancelled', 'unpaid', 'trialing'], 
    required: true 
  },
  currentPeriodStart: Date,
  currentPeriodEnd: Date,
  cancelAtPeriodEnd: { 
    type: Boolean, 
    default: false 
  },
  cancelledAt: Date,
  trialStart: Date,
  trialEnd: Date,
  priceId: String,
  quantity: { 
    type: Number, 
    default: 1 
  },
  metadata: Object
}, {
  timestamps: true
});

module.exports = mongoose.model('Subscription', subscriptionSchema);
