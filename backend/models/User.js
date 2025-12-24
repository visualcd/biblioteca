const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true,
        },
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    role: {
        type: DataTypes.ENUM('admin', 'bibliotecar', 'autor', 'student', 'profesor'),
        defaultValue: 'student',
    },
    phone: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    // Specific student fields
    faculty: DataTypes.STRING,
    student_code: DataTypes.STRING,
    specialization: DataTypes.STRING,
    year_of_study: DataTypes.INTEGER,
    group: DataTypes.STRING,
    credits: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
    created_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'Users',
            key: 'id'
        }
    },
    exam_status: { // Promovat / Nepromovat
        type: DataTypes.BOOLEAN,
        defaultValue: true,
    },
    // Security
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
    },
    otp_code: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    otp_expires: {
        type: DataTypes.DATE,
        allowNull: true,
    },
}, {
    timestamps: true,
});

module.exports = User;
