const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const User = require('../models/User');
const Subscription = require('../models/Subscription');

// Get price ID for plan type
const getPriceIdForPlan = (planType) => {
  const priceMap = {
    'solo': process.env.STRIPE_SOLO_PRICE_ID,
    'family': process.env.STRIPE_FAMILY_PRICE_ID,
    'school': process.env.STRIPE_SCHOOL_PRICE_ID
  };
  
  return priceMap[planType];
};

// Create a Stripe customer
const createCustomer = async (user) => {
  try {
    const customer = await stripe.customers.create({
      email: user.email,
      name: `${user.firstName} ${user.lastName}`,
      metadata: {
        userId: user._id.toString()
      }
    });

    // Update user with Stripe customer ID
    user.stripeCustomerId = customer.id;
    await user.save();

    return customer;
  } catch (error) {
    console.error('Error creating Stripe customer:', error);
    throw error;
  }
};

// Create a subscription
const createSubscription = async (req, res) => {
  try {
    const { planType } = req.body;
    const user = req.user;

    // Validate plan type
    const validPlans = ['solo', 'family', 'school'];
    if (!validPlans.includes(planType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid plan type'
      });
    }

    // Get price ID from environment variables
    const priceId = getPriceIdForPlan(planType);
    if (!priceId) {
      return res.status(400).json({
        success: false,
        message: `Price ID not configured for plan type: ${planType}`
      });
    }

    let customer;
    
    // Get or create Stripe customer
    if (user.stripeCustomerId) {
      try {
        customer = await stripe.customers.retrieve(user.stripeCustomerId);
      } catch (error) {
        // Customer doesn't exist, create a new one
        customer = await createCustomer(user);
      }
    } else {
      customer = await createCustomer(user);
    }

    // Create Stripe subscription
    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price: priceId }],
      payment_behavior: 'default_incomplete',
      payment_settings: { save_default_payment_method: 'on_subscription' },
      expand: ['latest_invoice.payment_intent'],
      metadata: {
        userId: user._id.toString(),
        planType: planType
      }
    });

    // Save subscription to database
    const dbSubscription = new Subscription({
      userId: user._id,
      planType: planType,
      stripeSubscriptionId: subscription.id,
      status: subscription.status,
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      priceId: priceId
    });

    await dbSubscription.save();

    // Update user plan type
    user.planType = planType;
    user.subscriptionStatus = 'active';
    await user.save();

    res.json({
      success: true,
      message: 'Subscription created successfully',
      data: {
        subscriptionId: subscription.id,
        clientSecret: subscription.latest_invoice.payment_intent.client_secret,
        planType: planType
      }
    });
  } catch (error) {
    console.error('Create subscription error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating subscription'
    });
  }
};

// Get subscription status
const getSubscriptionStatus = async (req, res) => {
  try {
    const user = req.user;
    
    const subscription = await Subscription.findOne({ 
      userId: user._id,
      status: { $in: ['active', 'trialing', 'past_due'] }
    }).sort({ createdAt: -1 });

    if (!subscription) {
      return res.json({
        success: true,
        data: {
          hasActiveSubscription: false,
          planType: user.planType,
          subscriptionStatus: user.subscriptionStatus
        }
      });
    }

    // Get latest subscription info from Stripe
    let stripeSubscription;
    try {
      stripeSubscription = await stripe.subscriptions.retrieve(subscription.stripeSubscriptionId);
    } catch (error) {
      console.error('Error fetching Stripe subscription:', error);
    }

    res.json({
      success: true,
      data: {
        hasActiveSubscription: true,
        subscription: {
          id: subscription._id,
          planType: subscription.planType,
          status: subscription.status,
          currentPeriodStart: subscription.currentPeriodStart,
          currentPeriodEnd: subscription.currentPeriodEnd,
          cancelAtPeriodEnd: subscription.cancelAtPeriodEnd
        },
        stripeSubscription: stripeSubscription ? {
          status: stripeSubscription.status,
          currentPeriodStart: new Date(stripeSubscription.current_period_start * 1000),
          currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
          cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end
        } : null
      }
    });
  } catch (error) {
    console.error('Get subscription status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching subscription status'
    });
  }
};

// Cancel subscription
const cancelSubscription = async (req, res) => {
  try {
    const user = req.user;
    
    const subscription = await Subscription.findOne({ 
      userId: user._id,
      status: { $in: ['active', 'trialing'] }
    }).sort({ createdAt: -1 });

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'No active subscription found'
      });
    }

    // Cancel subscription in Stripe
    await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
      cancel_at_period_end: true
    });

    // Update subscription in database
    subscription.cancelAtPeriodEnd = true;
    await subscription.save();

    res.json({
      success: true,
      message: 'Subscription will be cancelled at the end of the current period'
    });
  } catch (error) {
    console.error('Cancel subscription error:', error);
    res.status(500).json({
      success: false,
      message: 'Error cancelling subscription'
    });
  }
};

// Webhook handler for Stripe events
const handleWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionUpdate(event.data.object);
        break;
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object);
        break;
      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object);
        break;
      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object);
        break;
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    res.status(500).json({ error: 'Webhook handler failed' });
  }
};

// Handle subscription updates
const handleSubscriptionUpdate = async (stripeSubscription) => {
  const subscription = await Subscription.findOne({
    stripeSubscriptionId: stripeSubscription.id
  });

  if (subscription) {
    subscription.status = stripeSubscription.status;
    subscription.currentPeriodStart = new Date(stripeSubscription.current_period_start * 1000);
    subscription.currentPeriodEnd = new Date(stripeSubscription.current_period_end * 1000);
    subscription.cancelAtPeriodEnd = stripeSubscription.cancel_at_period_end;
    await subscription.save();

    // Update user subscription status
    const user = await User.findById(subscription.userId);
    if (user) {
      user.subscriptionStatus = stripeSubscription.status === 'active' ? 'active' : 'inactive';
      await user.save();
    }
  }
};

// Handle subscription deletion
const handleSubscriptionDeleted = async (stripeSubscription) => {
  const subscription = await Subscription.findOne({
    stripeSubscriptionId: stripeSubscription.id
  });

  if (subscription) {
    subscription.status = 'cancelled';
    subscription.cancelledAt = new Date();
    await subscription.save();

    // Update user subscription status
    const user = await User.findById(subscription.userId);
    if (user) {
      user.subscriptionStatus = 'cancelled';
      await user.save();
    }
  }
};

// Handle successful payment
const handlePaymentSucceeded = async (invoice) => {
  if (invoice.subscription) {
    await handleSubscriptionUpdate(invoice.subscription);
  }
};

// Handle failed payment
const handlePaymentFailed = async (invoice) => {
  if (invoice.subscription) {
    const subscription = await Subscription.findOne({
      stripeSubscriptionId: invoice.subscription
    });

    if (subscription) {
      subscription.status = 'past_due';
      await subscription.save();

      // Update user subscription status
      const user = await User.findById(subscription.userId);
      if (user) {
        user.subscriptionStatus = 'past_due';
        await user.save();
      }
    }
  }
};

module.exports = {
  createSubscription,
  getSubscriptionStatus,
  cancelSubscription,
  handleWebhook
};
