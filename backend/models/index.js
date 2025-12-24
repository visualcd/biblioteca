const Sequelize = require('sequelize');
const sequelize = require('../config/database');

const User = require('./User');
const Book = require('./Book');
const Loan = require('./Loan');

// Associations

// Author -> Books (One to Many)
User.hasMany(Book, { foreignKey: 'author_id', as: 'books_authored' });
Book.belongsTo(User, { foreignKey: 'author_id', as: 'author' });

// Student -> Loans (One to Many)
User.hasMany(Loan, { foreignKey: 'user_id', as: 'loans' });
Loan.belongsTo(User, { foreignKey: 'user_id', as: 'student' });

// Book -> Loans (One to Many)
Book.hasMany(Loan, { foreignKey: 'book_id', as: 'loans' });
Loan.belongsTo(Book, { foreignKey: 'book_id', as: 'book' });

module.exports = {
    sequelize,
    User,
    Book,
    Loan,
};
