const express = require('express');
const app = express();
const PORT = 3000;

// Import route
const aboutUsRoute = require('./routes/aboutUsRoute');

// Route About Us
app.use('/aboutus', aboutUsRoute);


app.get('/', (req, res) => {
  res.send('<p>Hello world!</p>');
});

// Kalo routenya gak ada, kirim 404
app.use((req, res) => {
  res.status(404).send('<h1>404 Not Found</h1><p>Halaman tidak ditemukan</p>');
});

app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}/`);
});
