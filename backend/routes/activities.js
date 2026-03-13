const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Activity = require('../models/Activity');

/**
 * GET /api/activities
 * Query params:
 *   days   - number of past days to include (default: 3)
 *   type   - filter by activityType: run | walk | cycle (optional)
 *   limit  - max results (default: 200)
 *
 * Returns activities with populated userId -> { _id, username }
 */
router.get('/', async (req, res) => {
  try {
    const days  = parseInt(req.query.days)  || 3;
    const limit = parseInt(req.query.limit) || 200;
    const type  = req.query.type; // optional

    const since = new Date();
    since.setDate(since.getDate() - days);
    since.setHours(0, 0, 0, 0); // start of that day

    const filter = { startTime: { $gte: since } };
    if (type && ['walk', 'cycle'].includes(type)) {
      filter.activityType = type;
    }

    const activities = await Activity.find(filter)
      .populate('userId', 'username')
      .sort({ startTime: -1 })
      .limit(limit)
      .lean();

    res.json(activities);
  } catch (err) {
    console.error('Activities fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch activities' });
  }
});

module.exports = router;
