require('dotenv').config();
const nodemailer = require('nodemailer');

const testEmail = async () => {
    console.log('Testing SMTP Connection...');
    console.log(`Host: ${process.env.SMTP_HOST}`);
    console.log(`Port: ${process.env.SMTP_PORT}`);
    console.log(`User: ${process.env.SMTP_USER}`);
    console.log(`Secure: ${Number(process.env.SMTP_PORT) === 465}`);

    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: Number(process.env.SMTP_PORT) === 465,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });

    try {
        await transporter.verify();
        console.log('✅ SMTP Connection Established Successfully');

        console.log('Attempting to send test email...');
        const info = await transporter.sendMail({
            from: `"Test Library" <${process.env.SMTP_USER}>`,
            to: process.env.SMTP_USER, // Send to self
            subject: 'Test Email form Library App',
            text: 'If you see this, email sending is working.',
        });

        console.log('✅ Email sent: %s', info.messageId);
    } catch (error) {
        console.error('❌ Error:', error);
    }
};

testEmail();
