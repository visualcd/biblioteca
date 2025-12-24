const { User } = require('../models');

// Get all users (Admin/Librarian/Professor)
exports.getUsers = async (req, res) => {
    try {
        const where = {};
        // If professor, handle view modes
        if (req.user.role.toLowerCase() === 'profesor') {
            if (req.query.view === 'all') {
                const { sequelize } = require('../models');
                const { Op } = require('sequelize');
                where[Op.and] = [
                    sequelize.where(sequelize.fn('lower', sequelize.cast(sequelize.col('role'), 'text')), 'student')
                ];
            } else {
                // Default: View MY students (created by me)
                where.created_by = req.user.id;
            }
        }

        const users = await User.findAll({
            where,
            attributes: { exclude: ['password', 'otp_code', 'otp_expires'] },
            order: [['createdAt', 'DESC']]
        });
        res.json(users);
    } catch (error) {
        console.error('GetUsers Error:', error);
        res.status(500).json({ message: 'Eroare server', error: error.message });
    }
};

// Update user (Admin/Librarian/Professor)
exports.updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findByPk(id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Professor logic
        if (req.user.role === 'profesor') {
            // Case 1: Claiming a student (Add to my list)
            if (req.body.action === 'claim') {
                await user.update({ created_by: req.user.id });
                return res.json({ message: 'Student adăugat în lista dumneavoastră!', user });
            }

            // Case 2: Editing a student (MUST be created by me)
            if (user.created_by !== req.user.id) {
                return res.status(403).json({ message: 'Nu aveți permisiunea de a edita acest student.' });
            }
        }

        // Sanitize integer fields
        if (req.body.year_of_study === '') req.body.year_of_study = null;
        if (req.body.credits === '') req.body.credits = 0;

        await user.update(req.body);
        res.json({ message: 'User updated', user });
    } catch (error) {
        console.error('UpdateUser Error:', error);
        res.status(500).json({ message: 'Eroare server', error: error.message });
    }
};

// Create User (Admin/Professor)
exports.createUser = async (req, res) => {
    try {
        let { name, email, role, faculty, student_code, credits, year_of_study, group } = req.body;

        // Sanitize
        if (year_of_study === '') year_of_study = null;
        if (credits === '') credits = 0;

        // Check permissions
        if (req.user.role !== 'admin' && req.user.role !== 'profesor') {
            return res.status(403).json({ message: 'Nu aveți drepturi de creare utilizatori.' });
        }

        // If professor, force role to student
        const targetRole = req.user.role === 'profesor' ? 'student' : (role || 'student').toLowerCase();

        const existing = await User.findOne({ where: { email } });
        if (existing) return res.status(400).json({ message: 'Email deja utilizat' });

        const bcrypt = require('bcryptjs');

        // Temporary password
        const tempPass = 'Parola123!';
        const hashedPassword = await bcrypt.hash(tempPass, 10);

        const user = await User.create({
            name,
            email,
            role: targetRole,
            faculty,
            student_code,
            year_of_study,
            group,
            credits: credits || 0,
            password: hashedPassword,
            isActive: true,
            created_by: req.user.role === 'profesor' ? req.user.id : null
        });

        res.status(201).json({ message: `Utilizator creat. Parola temporara: ${tempPass}`, user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Eroare server', error: error.message });
    }
};

// Delete User (Admin/Professor)
exports.deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findByPk(id);

        if (!user) return res.status(404).json({ message: 'User not found' });

        // Permission check
        if (req.user.role === 'profesor' && user.created_by !== req.user.id) {
            return res.status(403).json({ message: 'Nu puteți șterge acest utilizator.' });
        }

        if (user.role === 'admin') return res.status(403).json({ message: 'Nu se poate sterge adminul' });

        await user.destroy();
        res.json({ message: 'Utilizator sters definitiv.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Eroare server' });
    }
};

// Toggle activation
exports.toggleActivation = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findByPk(id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        if (user.role === 'admin' && req.user.id !== user.id) {
            // Protection: Admins can't deactivate other admins easily? Or allow it?
            // Requirement: "Singura interdictie... este de a se dezactiva (pe sine)"
        }

        if (user.role === 'admin' && user.id === req.user.id) {
            return res.status(403).json({ message: 'Nu va puteti dezactiva propriul cont.' });
        }

        await user.update({ isActive: !user.isActive });
        res.json({ message: `User ${user.isActive ? 'activat' : 'dezactivat'}` });
    } catch (error) {
        res.status(500).json({ message: 'Eroare server' });
    }
}
