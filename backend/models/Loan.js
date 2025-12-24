const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Loan = sequelize.define('Loan', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    loan_date: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
    return_due_date: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    actual_return_date: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    status: {
        type: DataTypes.ENUM('active', 'returned', 'overdue'),
        defaultValue: 'active',
    },
}, {
    timestamps: true,
});

module.exports = Loan;
