const express = require('express');
const connectDB = require('./config/db');

const app = express();

connectDB();

//init json middleware
app.use(express.json({ extended: false }));

app.get('/', (req, res) => res.json({ msg: 'Running' }));

//api routes
app.use('/api/users', require('./routes/users'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/confirm', require('./routes/confirm'));

const PORT = 5000;

app.listen(PORT, () => console.log(`App running on port ${PORT}`));
