const express = require('express');
const Challenge = require('../models/Challenge');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const challenges = await Challenge.find().populate('host', 'username')
      .populate('teams.members', 'username stats location');
    res.json(challenges);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const challenge = await Challenge.findById(req.params.id)
      .populate('host', 'username')
      .populate('teams.members', 'username stats location');
    if (!challenge) return res.status(404).json({ error: 'Not found' });
    res.json(challenge);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/:id/join', async (req, res) => {
  const { userId, teamName } = req.body; // Red or Blue
  try {
    const challenge = await Challenge.findById(req.params.id);
    if (!challenge) return res.status(404).json({ error: 'Not found' });
    
    // Check if user is already in a team
    const inTeam = challenge.teams.find(t => t.members.includes(userId));
    if (inTeam) return res.status(400).json({ error: 'User already in a team for this challenge' });

    const team = challenge.teams.find(t => t.teamName === teamName);
    if (team) {
      team.members.push(userId);
      await challenge.save();
      res.json(challenge);
    } else {
      res.status(404).json({ error: 'Team not found' });
    }
  } catch(err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/:id/start', async (req, res) => {
  const { userId } = req.body;
  try {
    const challenge = await Challenge.findById(req.params.id);
    if (!challenge) return res.status(404).json({ error: 'Not found' });
    
    if (challenge.host.toString() !== userId) {
      return res.status(403).json({ error: 'Only the host can start the challenge' });
    }
    
    // Require at least 1 user in each team
    const redCount = challenge.teams[0].members.length;
    const blueCount = challenge.teams[1].members.length;
    
    if (redCount === 0 || blueCount === 0) {
      return res.status(400).json({ error: 'Need at least 1 player in each team to start' });
    }
    
    challenge.status = 'active';
    await challenge.save();
    res.json(challenge);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
