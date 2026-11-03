import mongoose from 'mongoose';

// -------------------------------------------------------------
// 1. REWARD PROGRAM CONFIGURATION RULES SCHEMA
// -------------------------------------------------------------
const rewardRuleSchema = new mongoose.Schema(
  {
    // Points earned per ₹100 spent (e.g., 10 pts per ₹100 spent)
    pointsPerHundred: {
      type: Number,
      required: true,
      default: 10,
      min: [1, 'Must earn at least 1 point per ₹100']
    },
    // Rupee discount received per 100 points redeemed (e.g., 100 pts = ₹100)
    redemptionRate: {
      type: Number,
      required: true,
      default: 100,
      min: [1, 'Rupee value per 100 points must be at least ₹1']
    },
    // Welcome bonus points credited immediately upon customer sign-up
    welcomeBonus: {
      type: Number,
      required: true,
      default: 100,
      min: [0, 'Welcome bonus points cannot be negative']
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

// Singleton helper to fetch active rules or return default
rewardRuleSchema.statics.getRules = async function () {
  let rules = await this.findOne();
  if (!rules) {
    rules = await this.create({
      pointsPerHundred: 10,
      redemptionRate: 100,
      welcomeBonus: 100,
      isActive: true
    });
  }
  return rules;
};

// Update and return rules
rewardRuleSchema.statics.updateRules = async function (data) {
  let rules = await this.findOne();
  const pointsPerHundred = Number(data.pointsPerHundred ?? data.pointsPerRupee ?? 10);
  const redemptionRate = Number(data.redemptionRate ?? 100);
  const welcomeBonus = Number(data.welcomeBonus ?? 100);

  if (!rules) {
    rules = await this.create({
      pointsPerHundred,
      redemptionRate,
      welcomeBonus,
      isActive: true
    });
  } else {
    rules.pointsPerHundred = pointsPerHundred;
    rules.redemptionRate = redemptionRate;
    rules.welcomeBonus = welcomeBonus;
    await rules.save();
  }
  return rules;
};

// -------------------------------------------------------------
// 2. REWARD POINTS LEDGER & TRANSACTION AUDIT SCHEMA
// -------------------------------------------------------------
const rewardTransactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
      index: true
    },
    customerName: {
      type: String,
      default: 'Valued Patron'
    },
    customerEmail: {
      type: String,
      default: ''
    },
    type: {
      type: String,
      enum: ['Welcome Bonus', 'Order Earned', 'Points Redeemed', 'Privilege Bonus', 'Adjustment'],
      default: 'Order Earned'
    },
    points: {
      type: Number,
      required: true
    },
    orderId: {
      type: String,
      default: 'ATELIER-PRIVILEGE'
    },
    status: {
      type: String,
      enum: ['Completed', 'Pending', 'Cancelled'],
      default: 'Completed'
    },
    description: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

rewardTransactionSchema.statics.record = async function ({
  userId,
  customerName,
  customerEmail,
  type,
  points,
  orderId = '',
  description = ''
}) {
  return await this.create({
    userId,
    customerName: customerName || 'Valued Patron',
    customerEmail: customerEmail || '',
    type,
    points,
    orderId: orderId || 'ATELIER-PRIVILEGE',
    status: 'Completed',
    description
  });
};

rewardTransactionSchema.statics.getLedger = async function ({ limit = 50 } = {}) {
  const txs = await this.find().sort({ createdAt: -1 }).limit(limit).lean();
  return txs.map(t => ({
    id: String(t._id),
    _id: String(t._id),
    customer: t.customerName || 'Valued Patron',
    type: t.type,
    points: t.points > 0 ? `+${t.points}` : `${t.points}`,
    rawPoints: t.points,
    orderId: t.orderId || 'ATELIER-PRIVILEGE',
    date: new Date(t.createdAt).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }),
    status: t.status || 'Completed'
  }));
};

export const RewardRule = mongoose.models.RewardRule || mongoose.model('RewardRule', rewardRuleSchema);
export const RewardTransaction = mongoose.models.RewardTransaction || mongoose.model('RewardTransaction', rewardTransactionSchema);

export default {
  RewardRule,
  RewardTransaction
};
