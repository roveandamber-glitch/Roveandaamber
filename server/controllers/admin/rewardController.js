import mongoose from 'mongoose';
import { RewardRule, RewardTransaction } from '../../models/rewardModel.js';
import { User } from '../../models/userModel.js';
import { Order } from '../../models/orderModel.js';

// GET /api/admin/rewards
export const getRewardsDashboard = async (req, res) => {
  try {
    const rules = await RewardRule.getRules();

    // Calculate real stats from database
    const totalMembers = await User.countDocuments({ role: 'user' });

    // Aggregate user reward points
    const pointsAggregation = await User.aggregate([
      { $match: { role: 'user' } },
      { $group: { _id: null, totalPoints: { $sum: { $ifNull: ['$rewardPoints', 100] } } } }
    ]);
    const outstandingPoints = pointsAggregation[0]?.totalPoints || (totalMembers * (rules.welcomeBonus || 100));

    // Aggregate redeemed points from ledger
    const redeemedAggregation = await RewardTransaction.aggregate([
      { $match: { type: 'Points Redeemed' } },
      { $group: { _id: null, totalRedeemedPoints: { $sum: { $abs: '$points' } }, count: { $sum: 1 } } }
    ]);
    const rewardsRedeemedCount = redeemedAggregation[0]?.count || 0;
    const totalRedeemedPoints = redeemedAggregation[0]?.totalRedeemedPoints || 0;

    // Total points issued = outstanding + redeemed
    const pointsIssued = Math.max(outstandingPoints + totalRedeemedPoints, totalMembers * (rules.welcomeBonus || 100));

    // Calculate tier members
    const usersWithStats = await User.find({ role: 'user' }).lean();
    let silverCount = 0;
    let goldCount = 0;
    let platinumCount = 0;
    let blackCount = 0;

    usersWithStats.forEach(u => {
      const pts = u.rewardPoints || 0;
      if (pts >= 7500) blackCount++;
      else if (pts >= 3500) platinumCount++;
      else if (pts >= 1500) goldCount++;
      else silverCount++;
    });

    const tiers = [
      {
        name: 'Silver Connoisseur',
        minSpend: 0,
        minPoints: 0,
        perk: 'Standard 10% point accrual on every bespoke flacon',
        members: silverCount,
        color: 'border-slate-300 bg-slate-50 text-slate-800'
      },
      {
        name: 'Gold Reserve',
        minSpend: 15000,
        minPoints: 1500,
        perk: '1.25x point accrual multiplier + Private pre-release access',
        members: goldCount,
        color: 'border-amber-300 bg-amber-50 text-amber-900'
      },
      {
        name: 'Platinum Heritage',
        minSpend: 35000,
        minPoints: 3500,
        perk: '1.5x point accrual + Master Perfumer seasonal sample kit',
        members: platinumCount,
        color: 'border-cyan-300 bg-cyan-50 text-cyan-900'
      },
      {
        name: 'Black Edition',
        minSpend: 75000,
        minPoints: 7500,
        perk: '2.0x points + Dedicated concierge + Private bespoke bottle engraving',
        members: blackCount,
        color: 'border-stone-800 bg-[#1C120C] text-amber-200'
      }
    ];

    // Fetch recent ledger transactions
    let transactions = await RewardTransaction.getLedger({ limit: 50 });

    // If transactions are empty, seed recent customer signups into view
    if (transactions.length === 0 && usersWithStats.length > 0) {
      const initialSeedUsers = usersWithStats.slice(0, 5);
      for (const u of initialSeedUsers) {
        await RewardTransaction.record({
          userId: u._id,
          customerName: u.name,
          customerEmail: u.email,
          type: 'Welcome Bonus',
          points: rules.welcomeBonus || 100,
          orderId: 'SIGNUP-WELCOME',
          description: 'Welcome to Circle of Connoisseurs'
        });
      }
      transactions = await RewardTransaction.getLedger({ limit: 50 });
    }

    return res.json({
      success: true,
      data: {
        overview: {
          totalMembers: totalMembers || 1,
          pointsIssued,
          rewardsRedeemed: rewardsRedeemedCount,
          outstandingPoints
        },
        rules: {
          pointsPerHundred: rules.pointsPerHundred,
          pointsPerRupee: rules.pointsPerHundred / 100,
          redemptionRate: rules.redemptionRate,
          welcomeBonus: rules.welcomeBonus
        },
        tiers,
        transactions
      }
    });
  } catch (error) {
    console.error('Error fetching admin rewards dashboard:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve rewards dashboard'
    });
  }
};

// PUT /api/admin/rewards/rules
export const updateRewardRules = async (req, res) => {
  try {
    const { pointsPerHundred, pointsPerRupee, redemptionRate, welcomeBonus } = req.body;

    const resolvedPointsPerHundred = pointsPerHundred !== undefined
      ? Number(pointsPerHundred)
      : (pointsPerRupee !== undefined ? Number(pointsPerRupee) : 10);

    const updated = await RewardRule.updateRules({
      pointsPerHundred: Math.max(1, resolvedPointsPerHundred),
      redemptionRate: Math.max(1, Number(redemptionRate || 100)),
      welcomeBonus: Math.max(0, Number(welcomeBonus || 100))
    });

    return res.json({
      success: true,
      message: 'Rewards program configuration successfully updated.',
      data: {
        pointsPerHundred: updated.pointsPerHundred,
        pointsPerRupee: updated.pointsPerHundred / 100,
        redemptionRate: updated.redemptionRate,
        welcomeBonus: updated.welcomeBonus
      }
    });
  } catch (error) {
    console.error('Error updating reward rules:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to update reward rules'
    });
  }
};

// Helper to resolve customer User document by ID, Transaction ID, email, or name
const findCustomerUser = async (identifier) => {
  if (!identifier) return null;
  const raw = String(identifier).trim();
  let user = null;

  // 1. Try finding by MongoDB User ID
  if (mongoose.Types.ObjectId.isValid(raw)) {
    user = await User.findById(raw);
    if (!user) {
      // 2. If it was a RewardTransaction ID, look up the transaction's user or customer info
      const tx = await RewardTransaction.findById(raw).lean();
      if (tx) {
        if (tx.userId) {
          user = await User.findById(tx.userId);
        }
        if (!user && tx.customerEmail) {
          user = await User.findOne({ email: tx.customerEmail.toLowerCase().trim() });
        }
        if (!user && tx.customerName) {
          user = await User.findOne({ name: { $regex: new RegExp(`^${tx.customerName.trim()}$`, 'i') } });
        }
      }
    }
  }

  // 3. Try finding by email or name (exact match)
  if (!user) {
    user = await User.findOne({
      $or: [
        { email: raw.toLowerCase() },
        { name: raw }
      ]
    });
  }

  // 4. Try finding by case-insensitive name or email regex
  if (!user) {
    user = await User.findOne({
      $or: [
        { email: { $regex: new RegExp(`^${raw}$`, 'i') } },
        { name: { $regex: new RegExp(`^${raw}$`, 'i') } }
      ]
    });
  }

  return user;
};

// GET /api/admin/rewards/user/:userId/history
export const getUserRewardHistory = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await findCustomerUser(userId);

    if (!user) {
      return res.status(404).json({ success: false, message: 'Customer account not found.' });
    }

    const query = {
      $or: [
        { userId: user._id },
        { customerEmail: (user.email || '').toLowerCase().trim() },
        { customerName: user.name }
      ]
    };

    const transactions = await RewardTransaction.find(query).sort({ createdAt: -1 }).lean();

    const formattedTxs = transactions.map(t => ({
      id: String(t._id),
      _id: String(t._id),
      customer: t.customerName || user.name,
      type: t.type,
      points: t.points > 0 ? `+${t.points}` : `${t.points}`,
      rawPoints: t.points,
      orderId: t.orderId || 'ATELIER-PRIVILEGE',
      date: new Date(t.createdAt).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      }),
      createdAt: t.createdAt,
      status: t.status || 'Completed',
      description: t.description || ''
    }));

    return res.json({
      success: true,
      data: {
        user: {
          id: String(user._id),
          _id: String(user._id),
          name: user.name,
          email: user.email,
          phone: user.phone || '',
          rewardPoints: user.rewardPoints || 0,
          isWalletDisabled: Boolean(user.isWalletDisabled),
          walletDisabledReason: user.walletDisabledReason || ''
        },
        transactions: formattedTxs
      }
    });
  } catch (error) {
    console.error('Error fetching user reward history:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve user reward history.' });
  }
};

// PUT /api/admin/rewards/user/:userId/points
export const adjustUserPoints = async (req, res) => {
  try {
    const { userId } = req.params;
    const { action = 'set', points = 0, reason = '' } = req.body;

    const user = await findCustomerUser(userId);

    if (!user) {
      return res.status(404).json({ success: false, message: 'Customer account not found.' });
    }

    const currentPoints = user.rewardPoints || 0;
    const numPoints = Math.abs(parseInt(points, 10) || 0);

    let delta = 0;
    let newPoints = currentPoints;

    if (action === 'increase') {
      delta = numPoints;
      newPoints = currentPoints + delta;
    } else if (action === 'decrease') {
      delta = -Math.min(currentPoints, numPoints);
      newPoints = Math.max(0, currentPoints - numPoints);
    } else { // 'set' or direct edit
      newPoints = Math.max(0, numPoints);
      delta = newPoints - currentPoints;
    }

    user.rewardPoints = newPoints;
    await user.save();

    // Record adjustment transaction in ledger
    if (delta !== 0) {
      await RewardTransaction.record({
        userId: user._id,
        customerName: user.name,
        customerEmail: user.email,
        type: 'Adjustment',
        points: delta,
        orderId: `ADJ-${Date.now().toString().slice(-6)}`,
        description: reason || `Administrative update of points (${delta > 0 ? '+' : ''}${delta} pts)`
      });
    }

    return res.json({
      success: true,
      message: `Points updated successfully. New balance: ${newPoints.toLocaleString()} pts.`,
      data: {
        newPoints,
        delta,
        user: {
          id: String(user._id),
          _id: String(user._id),
          name: user.name,
          email: user.email,
          rewardPoints: user.rewardPoints,
          isWalletDisabled: Boolean(user.isWalletDisabled)
        }
      }
    });
  } catch (error) {
    console.error('Error adjusting user points:', error);
    return res.status(500).json({ success: false, message: error.message || 'Failed to adjust points.' });
  }
};

// PUT /api/admin/rewards/user/:userId/wallet
export const toggleUserWallet = async (req, res) => {
  try {
    const { userId } = req.params;
    const { isWalletDisabled, reason = '' } = req.body;

    const user = await findCustomerUser(userId);

    if (!user) {
      return res.status(404).json({ success: false, message: 'Customer account not found.' });
    }

    user.isWalletDisabled = Boolean(isWalletDisabled);
    user.walletDisabledReason = isWalletDisabled ? (reason || 'Wallet suspended by boutique administration') : '';
    await user.save();

    return res.json({
      success: true,
      message: isWalletDisabled 
        ? `${user.name}'s wallet has been disabled.` 
        : `${user.name}'s wallet has been enabled.`,
      data: {
        isWalletDisabled: user.isWalletDisabled,
        walletDisabledReason: user.walletDisabledReason
      }
    });
  } catch (error) {
    console.error('Error toggling user wallet:', error);
    return res.status(500).json({ success: false, message: 'Failed to update user wallet status.' });
  }
};
