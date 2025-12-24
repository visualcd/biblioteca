const { Book, User, sequelize } = require('../models');
const { Op } = require('sequelize');

exports.getMyBooks = async (req, res) => {
    try {
        const books = await Book.findAll({
            where: { author_id: req.user.id },
            attributes: {
                include: [
                    [sequelize.literal(`(
                        SELECT COUNT(*)
                        FROM "Loans" AS "loans"
                        WHERE
                            "loans"."book_id" = "Book"."id"
                    )`), 'loan_count']
                ]
            }
        });
        res.json(books);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Eroare server' });
    }
};

// List books (with filters)
exports.getBooks = async (req, res) => {
    try {
        const { search, category, status } = req.query;
        const where = {};

        // Filter by status (Default only published for students, unless admin/author/librarian override)
        // We will handle role-based visibility in frontend or middleware, but generally:
        // If user is not admin/author/librarian, show only published.
        // For now, let's allow filtering via query param, but basic default is 'published' for public.
        // If 'all' is requested, check permissions in middleware (todo).

        if (status) {
            where.status = status;
        } else {
            // Default behavior if not specified: usually published?
            // Let's assume the frontend asks for specific status or we default to published.
            // where.status = 'published'; 
        }

        if (search) {
            where[Op.or] = [
                { title: { [Op.iLike]: `%${search}%` } },
                { isbn: { [Op.iLike]: `%${search}%` } },
            ];
        }

        if (category) {
            where.category = category;
        }

        // Filter: E-Book vs Physical
        // req.query.is_digital might be string 'true'/'false'
        if (req.query.is_digital !== undefined && req.query.is_digital !== 'all') {
            const isDigital = req.query.is_digital === 'true';
            if (isDigital) {
                where.pdf_path = { [Op.not]: null };
            } else {
                where.pdf_path = { [Op.is]: null };
            }
        }

        const books = await Book.findAll({
            where,
            include: [{ model: User, as: 'author', attributes: ['name'] }]
        });
        res.json(books);
    } catch (error) {
        res.status(500).json({ message: 'Eroare server' });
    }
};

// Create Book
exports.createBook = async (req, res) => {
    try {
        const { title, isbn, category, description, publisher, publication_year, edition, total_stock } = req.body;

        let image_url = 'uploads/default_cover.png';
        let pdf_path = null;

        if (req.files) {
            if (req.files.cover) image_url = req.files.cover[0].path;
            if (req.files.bookFile) pdf_path = req.files.bookFile[0].path;
        }

        const book = await Book.create({
            title,
            isbn,
            category,
            description,
            publisher,
            publication_year,
            edition,
            total_stock: total_stock || 1,
            available_stock: total_stock || 1,
            author_id: req.user.id,
            status: 'draft',
            image_url,
            pdf_path
        });

        res.status(201).json({ message: 'Carte creata (Draft)', book });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Eroare server' });
    }
};

// Update Book
exports.updateBook = async (req, res) => {
    try {
        const { id } = req.params;
        const book = await Book.findByPk(id);

        if (!book) return res.status(404).json({ message: 'Carte inexistenta' });

        // Check permissions
        if (req.user.role === 'autor' && book.author_id !== req.user.id) {
            return res.status(403).json({ message: 'Nu aveti permisiunea' });
        }

        const updateData = { ...req.body };

        if (req.files) {
            if (req.files.cover) updateData.image_url = req.files.cover[0].path;
            if (req.files.bookFile) updateData.pdf_path = req.files.bookFile[0].path;
        }

        // Ensure default cover if missing (progressive fix)
        if (!book.image_url && (!req.files || !req.files.cover)) {
            updateData.image_url = 'uploads/default_cover.png';
        }

        // If author updates, maybe reset to draft? Requirement doesn't specify, but safe practice.
        // For MVP we leave as is or let admin re-approve.

        await book.update(updateData);
        res.json({ message: 'Carte actualizata', book });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Eroare server' });
    }
};

exports.approveBook = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body; // 'published' or 'draft'

        // Middleware should ensure only Admin/Librarian can hit this
        const book = await Book.findByPk(id);
        if (!book) return res.status(404).json({ message: 'Carte inexistenta' });

        await book.update({ status });

        // If rejected (back to draft), maybe notify author?

        res.json({ message: `Status actualizat la ${status}` });
    } catch (error) {
        res.status(500).json({ message: 'Eroare server' });
    }
}

exports.deleteBook = async (req, res) => {
    try {
        const { id } = req.params;
        const book = await Book.findByPk(id);
        if (!book) return res.status(404).json({ message: 'Carte inexistenta' });

        // Author check
        if (req.user.role === 'autor' && book.author_id !== req.user.id) {
            return res.status(403).json({ message: 'Nu aveti permisiunea' });
        }

        // Prevent accidental delete if published? "doar dupa dezaprobarea initiala"
        if (req.user.role === 'autor' && book.status === 'published') {
            return res.status(400).json({ message: 'Cartea trebuie retrasa (dezaprobata) inainte de stergere.' });
        }

        await book.destroy();
        res.json({ message: 'Carte stearsa' });
    } catch (error) {
        res.status(500).json({ message: 'Eroare server' });
    }
}

exports.trackRead = async (req, res) => {
    try {
        const { id } = req.params;
        const book = await Book.findByPk(id);
        if (!book) return res.status(404).json({ message: 'Book not found' });

        await book.increment('view_count'); // "Read" counts as a view/read
        await book.increment('download_count'); // Or download if PDF opened

        res.json({ message: 'Tracked' });
    } catch (e) {
        res.status(500).json({ message: 'Error' });
    }
};
