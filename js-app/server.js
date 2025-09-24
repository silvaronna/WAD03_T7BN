const express = require('express');
const app = express();
const PORT = 3000;

// Import routes
const aboutUsRoute = require('./routes/aboutUsRoute');
const greetingRoutes = require('./routes/greetingRoutes');
const userRoutes = require('./routes/userRoutes');

// middleware untuk auto-konvert ke format json
app.use(express.json());

// Route About Us
app.use('/aboutus', aboutUsRoute);

// Route Greeting
app.use('/greeting', greetingRoutes);

// Route User Management
app.use('/users', userRoutes);


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
