const { User } = require('../models');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const { Op } = require('sequelize');

// Setup Transporter (Mock or Real)
// Setup Transporter (Mock or Real)
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.ethereal.email',
    port: process.env.SMTP_PORT || 587,
    secure: Number(process.env.SMTP_PORT) === 465, // Use secure for 465
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

const generateOTP = () => {
    // 8 char alphanumeric
    return crypto.randomBytes(4).toString('hex').toUpperCase();
};

const sendOTPEmail = async (email, otp) => {
    try {
        const info = await transporter.sendMail({
            from: `"Biblioteca Virtuala" <${process.env.SMTP_USER}>`,
            to: email,
            subject: 'Codul tau de autentificare',
            text: `Codul tau este: ${otp}. Valabil 5 minute.`,
            html: `<b>Codul tau este: ${otp}</b>. Valabil 5 minute.`,
        });
        console.log("Email sent: %s", info.messageId);
    } catch (err) {
        console.error("Error sending email", err);
        throw new Error(`Email delivery failed: ${err.message}`);
    }
};

exports.register = async (req, res) => {
    try {
        let { name, email, role, faculty, student_code } = req.body;
        email = email.toLowerCase(); // Force lowercase email

        // Check if exists
        const existing = await User.findOne({ where: { email } });
        if (existing) return res.status(400).json({ message: 'Email deja utilizat' });

        const randomPass = crypto.randomBytes(10).toString('hex');
        const hashedPassword = await bcrypt.hash(randomPass, 10);

        const user = await User.create({
            name,
            email,
            role: (role || 'student').toLowerCase(),
            faculty,
            student_code,
            password: hashedPassword
        });

        res.status(201).json({ message: 'Cont creat cu succes. Te rog sa te autentifici.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Eroare server', error: error.message });
    }
};

exports.login = async (req, res) => {
    try {
        let { email } = req.body;

        // Case insensitive find
        const { Op } = require('sequelize');
        const { sequelize } = require('../models');
        const user = await User.findOne({
            where: sequelize.where(
                sequelize.fn('lower', sequelize.col('email')),
                email.toLowerCase()
            )
        });

        if (!user) {
            return res.status(404).json({ message: 'Utilizator inexistent' });
        }

        if (!user.isActive) {
            return res.status(403).json({ message: 'Cont dezactivat. Contactati administratorul sau folositi procedura de recuperare.' });
        }

        const otp = generateOTP();
        const expires = new Date(Date.now() + 5 * 60 * 1000); // 5 mins

        await user.update({ otp_code: otp, otp_expires: expires });

        console.log(`[DEV] OTP for ${user.email}: ${otp}`);
        await sendOTPEmail(user.email, otp);

        res.json({ message: 'OTP trimis pe email' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Eroare server' });
    }
};

exports.verifyOTP = async (req, res) => {
    try {
        let { email, otp } = req.body;

        const { sequelize } = require('../models');
        const user = await User.findOne({
            where: sequelize.where(
                sequelize.fn('lower', sequelize.col('email')),
                email.toLowerCase()
            )
        });

        if (!user) return res.status(404).json({ message: 'User not found' });

        // Case insensitive OTP check
        if (!user.otp_code || user.otp_code.toUpperCase() !== otp.toUpperCase()) {
            return res.status(400).json({ message: 'OTP invalid' });
        }

        if (new Date() > user.otp_expires) {
            return res.status(400).json({ message: 'OTP expirat' });
        }

        // Clear OTP
        await user.update({ otp_code: null, otp_expires: null });

        // Issue Token
        const token = jwt.sign(
            { id: user.id, role: user.role.toLowerCase(), name: user.name },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({ token, user: { id: user.id, name: user.name, role: user.role } });
    } catch (error) {
        res.status(500).json({ message: 'Eroare server' });
    }
};

// Intital Setup for Admin
exports.setupAdmin = async (req, res) => {
    try {
        const { email } = req.body;

        // Step 2: Verify OTP and Activate
        if (req.body.otp) {
            const user = await User.findOne({ where: { email } });
            if (!user) return res.status(400).json({ message: 'Utilizator inexistent. Initializati pasul 1.' });

            if (user.role !== 'admin') return res.status(403).json({ message: 'Acest endpoint este doar pentru Admin.' });

            if (user.otp_code !== req.body.otp) return res.status(400).json({ message: 'OTP Invalid' });

            await user.update({ isActive: true, otp_code: null });
            const token = jwt.sign({ id: user.id, role: 'admin' }, process.env.JWT_SECRET);
            return res.json({
                token,
                user: { id: user.id, name: user.name, role: 'admin' },
                message: 'Admin activat si configurat cu succes'
            });
        }

        // Step 1: Send OTP for Activation/Creation
        else {
            let user = await User.findOne({ where: { email } });
            const otp = generateOTP();
            const expires = new Date(Date.now() + 5 * 60 * 1000);

            if (user) {
                // Check if already active admin
                if (user.role === 'admin' && user.isActive) {
                    return res.status(403).json({ message: 'Admin deja existent si activ.' });
                }
                // If inactive admin or if we decide to allow hijacking/recovery via this route (dangerous in prod but ok for MVP install)
                // Requirement: "Administratorul... Singura interdicție... este de a se dezactiva" -> implying robust admin.
                // For Install page, if admin exists but inactive, we allow sending OTP to activate.
                if (user.role === 'admin' && !user.isActive) {
                    await user.update({ otp_code: otp, otp_expires: expires });
                    console.log(`[SETUP] Re-sending OTP for Inactive Admin ${email}: ${otp}`);
                    await sendOTPEmail(email, otp);
                    return res.json({ message: 'OTP trimis pentru activare admin existent' });
                }

                // If user exists but not admin?
                return res.status(400).json({ message: 'Email deja utilizat de un non-admin.' });
            }

            // Create new Admin
            const randomPass = crypto.randomBytes(10).toString('hex');
            user = await User.create({
                name: 'Administrator',
                email,
                password: await bcrypt.hash(randomPass, 10),
                role: 'admin',
                isActive: false, // Activate after OTP
                otp_code: otp,
                otp_expires: expires
            });

            console.log(`[SETUP] OTP for New Admin ${email}: ${otp}`);
            await sendOTPEmail(email, otp);
            return res.json({ message: 'OTP trimis pentru creare admin' });
        }

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Eroare setup' });
    }
};
