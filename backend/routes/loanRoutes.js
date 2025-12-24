const express = require('express');
const router = express.Router();
const loanController = require('../controllers/loanController');
const { authMiddleware, roleMiddleware } = require('../middleware/authMiddleware');

router.get('/', authMiddleware, loanController.getLoans);
router.post('/', authMiddleware, roleMiddleware(['admin', 'bibliotecar', 'student']), loanController.createLoan);
router.put('/:id/return', authMiddleware, roleMiddleware(['admin', 'bibliotecar', 'student']), loanController.returnLoan);
router.put('/:id/extend', authMiddleware, roleMiddleware(['student', 'admin', 'bibliotecar']), loanController.extendLoan);

module.exports = router;
