const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Expense = require('../models/Expense');
const categorizationService = require('../services/categorization');

// @route   POST /api/voice/command
// @desc    Process voice command
// @access  Private
router.post('/command', auth, async (req, res) => {
  try {
    const { transcript } = req.body;

    if (!transcript) {
      return res.status(400).json({ success: false, message: 'No transcript provided' });
    }

    const command = parseVoiceCommand(transcript.toLowerCase());

    switch (command.action) {
      case 'add_expense':
        const expense = await addExpenseFromVoice(req.user._id, command.data);
        return res.json({
          success: true,
          action: 'add_expense',
          expense,
          response: `Added ₹${expense.amount} for ${expense.category}`
        });

      case 'query_spending':
        const spendingData = await querySpending(req.user._id, command.data);
        return res.json({
          success: true,
          action: 'query_spending',
          data: spendingData,
          response: generateSpendingResponse(spendingData, command.data)
        });

      case 'get_summary':
        const summary = await getSummary(req.user._id);
        return res.json({
          success: true,
          action: 'get_summary',
          data: summary,
          response: generateSummaryResponse(summary)
        });

      default:
        return res.json({
          success: false,
          message: 'Could not understand the command. Try: "Add 50 rupees for groceries" or "How much did I spend on food?"'
        });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * Parse voice command and extract intent
 */
function parseVoiceCommand(transcript) {
  // Add expense patterns
  const addPatterns = [
    /add\s+(?:rs\.?|rupees?)?\s*(\d+)\s+(?:rupees?\s+)?(?:for|to|in)\s+(.+)/i,
    /spent\s+(?:rs\.?|rupees?)?\s*(\d+)\s+(?:rupees?\s+)?(?:on|for)\s+(.+)/i,
    /(\d+)\s+(?:rs\.?|rupees?)\s+(?:for|on)\s+(.+)/i
  ];

  for (const pattern of addPatterns) {
    const match = transcript.match(pattern);
    if (match) {
      return {
        action: 'add_expense',
        data: {
          amount: parseInt(match[1]),
          description: match[2].trim()
        }
      };
    }
  }

  // Query spending patterns
  const queryPatterns = [
    /how\s+much\s+(?:did\s+)?(?:i\s+)?(?:spend|spent)\s+(?:on\s+)?(.+?)(?:\s+(?:last|this)\s+(week|month|year))?/i,
    /(?:what|show|tell)\s+(?:me\s+)?(?:my\s+)?spending\s+(?:on\s+)?(.+?)(?:\s+(?:last|this)\s+(week|month|year))?/i,
    /total\s+(?:spent|spending)\s+(?:on\s+)?(.+?)(?:\s+(?:last|this)\s+(week|month|year))?/i
  ];

  for (const pattern of queryPatterns) {
    const match = transcript.match(pattern);
    if (match) {
      return {
        action: 'query_spending',
        data: {
          category: match[1].trim(),
          period: match[2] || 'month'
        }
      };
    }
  }

  // Summary patterns
  if (/(?:show|give|get)\s+(?:me\s+)?(?:my\s+)?(?:spending\s+)?summary/i.test(transcript) ||
      /what\s+(?:is|are)\s+my\s+(?:total\s+)?expenses?/i.test(transcript)) {
    return {
      action: 'get_summary',
      data: {}
    };
  }

  return { action: 'unknown', data: {} };
}

/**
 * Add expense from voice command
 */
async function addExpenseFromVoice(userId, data) {
  const { amount, description } = data;
  
  // Auto-categorize
  const category = categorizationService.categorize(description, amount);
  const tags = categorizationService.suggestTags(description);

  const expense = new Expense({
    user: userId,
    amount,
    category,
    description,
    tags,
    date: new Date()
  });

  await expense.save();
  return expense;
}

/**
 * Query spending data
 */
async function querySpending(userId, data) {
  const { category, period } = data;
  
  const now = new Date();
  let startDate;

  switch (period) {
    case 'week':
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
      break;
    case 'year':
      startDate = new Date(now.getFullYear(), 0, 1);
      break;
    case 'month':
    default:
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
  }

  // Try to match category
  const matchedCategory = categorizationService.categorize(category);
  
  const query = {
    user: userId,
    date: { $gte: startDate }
  };

  if (matchedCategory && matchedCategory !== 'other') {
    query.category = matchedCategory;
  }

  const expenses = await Expense.find(query);
  const total = expenses.reduce((sum, exp) => sum + exp.amount, 0);

  return {
    category: matchedCategory || category,
    period,
    total,
    count: expenses.length,
    expenses: expenses.slice(0, 5) // Return top 5
  };
}

/**
 * Get overall summary
 */
async function getSummary(userId) {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const expenses = await Expense.find({
    user: userId,
    date: { $gte: monthStart }
  });

  const total = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  
  // Category breakdown
  const byCategory = {};
  expenses.forEach(exp => {
    byCategory[exp.category] = (byCategory[exp.category] || 0) + exp.amount;
  });

  // Top category
  const topCategory = Object.entries(byCategory).sort((a, b) => b[1] - a[1])[0];

  return {
    total,
    count: expenses.length,
    topCategory: topCategory ? { name: topCategory[0], amount: topCategory[1] } : null,
    byCategory
  };
}

/**
 * Generate natural language response for spending query
 */
function generateSpendingResponse(data, query) {
  const { category, period, total, count } = data;
  
  if (count === 0) {
    return `You haven't spent anything on ${category} ${period === 'month' ? 'this month' : `this ${period}`}.`;
  }

  return `You spent ₹${Math.round(total)} on ${category} ${period === 'month' ? 'this month' : `this ${period}`}. That's ${count} transaction${count > 1 ? 's' : ''}.`;
}

/**
 * Generate natural language response for summary
 */
function generateSummaryResponse(summary) {
  const { total, count, topCategory } = summary;
  
  let response = `This month, you've spent a total of ₹${Math.round(total)} across ${count} transactions.`;
  
  if (topCategory) {
    response += ` Your highest spending category is ${topCategory.name} at ₹${Math.round(topCategory.amount)}.`;
  }

  return response;
}

module.exports = router;
