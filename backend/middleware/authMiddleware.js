const jwt = require('jsonwebtoken');

exports.authMiddleware = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
        return res.status(401).json({ message: 'Acces interzis. Lipseste token-ul.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Token invalid.' });
    }
};

exports.roleMiddleware = (roles) => {
    return (req, res, next) => {
        // Normalize role to lowercase for comparison
        const userRole = req.user.role ? req.user.role.toLowerCase() : '';
        if (!roles.includes(userRole)) {
            return res.status(403).json({ message: 'Acces interzis. Nu aveti rolul necesar.' });
        }
        next();
    };
};
