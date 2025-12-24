const { Loan, Book, User, sequelize } = require('../models');
const { Op } = require('sequelize');

exports.createLoan = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        let { book_id, user_id, days } = req.body;

        // If student, force their own ID
        if (req.user.role === 'student') {
            user_id = req.user.id;
        }

        const book = await Book.findByPk(book_id, { transaction: t });
        if (!book) {
            await t.rollback();
            return res.status(404).json({ message: 'Carte inexistenta' });
        }

        // Check format: active loans for this book/user?
        const existingLoan = await Loan.findOne({
            where: {
                book_id,
                user_id,
                status: 'active'
            },
            transaction: t
        });

        if (existingLoan) {
            await t.rollback();
            return res.status(400).json({ message: 'Ai deja un împrumut activ pentru această carte.' });
        }

        // Check stock ONLY if not digital
        // Robust check: ensure it's a string and not empty
        const isDigital = (typeof book.pdf_path === 'string' && book.pdf_path.length > 0);

        if (!isDigital && book.available_stock <= 0) {
            await t.rollback();
            // Provide debug info in dev mode (or helpful message)
            return res.status(400).json({
                message: 'Stoc epuizat',
                details: `Digital: ${isDigital} (Path: ${book.pdf_path}), Stock: ${book.available_stock}`
            });
        }

        const returnDate = new Date();
        returnDate.setDate(returnDate.getDate() + (days || 14)); // Default 14 days

        const loan = await Loan.create({
            book_id,
            user_id,
            return_due_date: returnDate,
            status: 'active'
        }, { transaction: t });

        // Decrement stock ONLY if not digital
        if (!isDigital) {
            await book.decrement('available_stock', { transaction: t });
        }
        await book.increment('loan_count', { transaction: t });

        await t.commit();
        res.status(201).json({ message: 'Imprumut creat', loan });
    } catch (error) {
        await t.rollback();
        console.error(error);
        res.status(500).json({ message: 'Eroare server' });
    }
};

exports.returnLoan = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { id } = req.params;
        const loan = await Loan.findByPk(id, { transaction: t });

        if (!loan) {
            await t.rollback();
            return res.status(404).json({ message: 'Imprumut inexistent' });
        }

        // Security check for students
        if (req.user.role === 'student' && loan.user_id !== req.user.id) {
            await t.rollback();
            return res.status(403).json({ message: 'Nu puteți returna împrumutul altcuiva' });
        }

        if (loan.status === 'returned') {
            await t.rollback();
            return res.status(400).json({ message: 'Cartea este deja returnata' });
        }

        await loan.update({
            status: 'returned',
            actual_return_date: new Date()
        }, { transaction: t });

        // Increment stock ONLY if not digital
        const book = await Book.findByPk(loan.book_id, { transaction: t });
        if (book && !book.pdf_path) {
            await book.increment('available_stock', { transaction: t });
        }

        await t.commit();
        res.json({ message: 'Carte returnata' });
    } catch (error) {
        await t.rollback();
        res.status(500).json({ message: 'Eroare server' });
    }
};

exports.getLoans = async (req, res) => {
    try {
        const { user_id, status } = req.query;
        const where = {};

        // Student sees own loans
        if (req.user.role === 'student' || req.user.role === 'STUDENT') {
            where.user_id = req.user.id;
        } else if (user_id) {
            // Admin/Librarian can filter by user
            where.user_id = user_id;
        }

        if (status) where.status = status;

        const loans = await Loan.findAll({
            where,
            include: [
                { model: Book, as: 'book', attributes: ['title', 'isbn', 'pdf_path', 'image_url'] },
                { model: User, as: 'student', attributes: ['name', 'email'] }
            ]
        });

        res.json(loans);
    } catch (error) {
        res.status(500).json({ message: 'Eroare server' });
    }
};
exports.extendLoan = async (req, res) => {
    try {
        const { id } = req.params;
        const loan = await Loan.findByPk(id);

        if (!loan) return res.status(404).json({ message: 'Loan not found' });

        // Security: only own loan if student
        if (req.user.role === 'student' && loan.user_id !== req.user.id) {
            return res.status(403).json({ message: 'Forbidden' });
        }

        const newDate = new Date(loan.return_due_date);
        newDate.setDate(newDate.getDate() + 7); // Extend 7 days

        await loan.update({ return_due_date: newDate });
        res.json({ message: 'Loan extended', loan });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
