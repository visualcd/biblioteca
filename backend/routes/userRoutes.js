const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authMiddleware, roleMiddleware } = require('../middleware/authMiddleware');

router.get('/', authMiddleware, roleMiddleware(['admin', 'bibliotecar', 'profesor']), userController.getUsers);
router.post('/', authMiddleware, roleMiddleware(['admin', 'profesor']), userController.createUser);
router.put('/:id', authMiddleware, roleMiddleware(['admin', 'bibliotecar', 'profesor']), userController.updateUser);
router.put('/:id/toggle-activation', authMiddleware, roleMiddleware(['admin', 'bibliotecar']), userController.toggleActivation);
router.delete('/:id', authMiddleware, roleMiddleware(['admin', 'profesor']), userController.deleteUser);

module.exports = router;
