const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const reservationsRoute = require('./routes/reservations');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/reservations', reservationsRoute);

app.get('/', (req, res) => {
  res.send('Al-Nawab Backend API is running.');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
