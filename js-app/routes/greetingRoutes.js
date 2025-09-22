const express = require('express');
const router = express.Router();

router.get('/:user', (req, res) => {
  const { user } = req.params;
  const timestamp = new Date().toISOString();

  const response = {
    success: true,
    message: `Halo ${user},Kami Team 7 Bukan Naruto!`,
    timestamp: timestamp,
    data: {
      greeting: "Ini adalah bentuk tes app kami!",
      user: user,
      status: "active"
    }
  };

  // Format JSON with proper indentation (2 spaces)
  res.set('Content-Type', 'application/json');
  res.send(JSON.stringify(response, null, 2));
});

module.exports = router;