const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Book = sequelize.define('Book', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    pdf_path: {
        type: DataTypes.STRING,
        allowNull: true, // Optional, some books might be physical only
    },
    isbn: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    publisher: DataTypes.STRING,
    publication_year: DataTypes.INTEGER,
    edition: DataTypes.STRING,
    category: DataTypes.STRING,
    image_url: DataTypes.STRING, // For cover
    description: DataTypes.TEXT,

    // Business logic
    download_allowed: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    status: {
        type: DataTypes.ENUM('draft', 'published'),
        defaultValue: 'draft',
    },

    // Stock management
    total_stock: {
        type: DataTypes.INTEGER,
        defaultValue: 1,
    },
    available_stock: {
        type: DataTypes.INTEGER,
        defaultValue: 1,
    },

    // Statistics
    view_count: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
    download_count: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
    loan_count: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
}, {
    timestamps: true,
});

module.exports = Book;
