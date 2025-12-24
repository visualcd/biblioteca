const express = require('express');
const cors = require('cors');
const sequelize = require('./config/database');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

const authRoutes = require('./routes/authRoutes');

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/auth', authRoutes);
const bookRoutes = require('./routes/bookRoutes');
app.use('/api/books', bookRoutes);
const userRoutes = require('./routes/userRoutes');
app.use('/api/users', userRoutes);
const loanRoutes = require('./routes/loanRoutes');
app.use('/api/loans', loanRoutes);




// Test Route
app.get('/', (req, res) => {
    res.send('API Biblioteca Virtuala este funcțional!');
});

// Database Sync & Server Start
const startServer = async () => {
    try {
        await sequelize.authenticate();
        console.log('Conexiunea la baza de date a fost stabilită cu succes.');

        await sequelize.sync({ alter: true });

        app.listen(PORT, () => {
            console.log(`Serverul rulează pe portul ${PORT}`);
        });
    } catch (error) {
        console.error('Nu s-a putut conecta la baza de date:', error);
    }
};

if (require.main === module) {
    startServer();
}

module.exports = { app, sequelize };
