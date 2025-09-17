const express = require('express');
const router = express.Router();

// Route untuk halaman About Us
router.get('/azka', (req, res) => {
  res.send('<h1>About Azka</h1><p>Nama: Azka Abdillah<br>NIM: 24120400001</p>');
});

router.get('/fairuz', (req, res) => {
  res.send('<h1>About Fairuz</h1><p>Nama: Fairuz Fajri<br>NIM: 24120400014</p>');
});

router.get('/jaya', (req, res) => {
  res.send('<h1>About Jaya</h1><p>Nama: Muhamad Jaya Kusuma<br>NIM: 24130400003</p>');
});


module.exports = router;