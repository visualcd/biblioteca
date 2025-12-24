const express = require('express');
const router = express.Router();
const bookController = require('../controllers/bookController');
const { authMiddleware, roleMiddleware } = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');

// Public (with search)
router.get('/', bookController.getBooks);

// Protected
router.get('/my-books', authMiddleware, roleMiddleware(['autor']), bookController.getMyBooks);
router.post('/', authMiddleware, roleMiddleware(['autor', 'admin']), upload.fields([{ name: 'cover', maxCount: 1 }, { name: 'bookFile', maxCount: 1 }]), bookController.createBook);
router.put('/:id', authMiddleware, roleMiddleware(['autor', 'admin', 'bibliotecar']), upload.fields([{ name: 'cover', maxCount: 1 }, { name: 'bookFile', maxCount: 1 }]), bookController.updateBook);
router.post('/:id/approve', authMiddleware, roleMiddleware(['admin', 'bibliotecar']), bookController.approveBook);
router.post('/:id/read', authMiddleware, bookController.trackRead);
router.delete('/:id', authMiddleware, roleMiddleware(['autor', 'admin']), bookController.deleteBook);

module.exports = router;
