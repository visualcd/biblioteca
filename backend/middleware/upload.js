const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads dir exists
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        // Try to get ISBN from body. Note: 'isbn' field MUST be sent before files in FormData for this to work.
        const isbn = req.body.isbn || 'NO_ISBN';
        const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
        const uniqueSuffix = Date.now();
        // Pattern: ISBN-Upload-Date-Unique.ext
        // We include unique suffix to avoid overwrites if same ISBN uploaded multiple times instantly
        cb(null, `${isbn}-${file.fieldname}-${date}-${uniqueSuffix}${path.extname(file.originalname)}`);
    }
});

const fileFilter = (req, file, cb) => {
    if (file.fieldname === 'cover') {
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif|webp|avif)$/)) {
            return cb(new Error('Only image files (jpg, jpeg, png, gif, webp, avif) are allowed for cover!'), false);
        }
    } else if (file.fieldname === 'bookFile') {
        if (!file.originalname.match(/\.(pdf|epub)$/)) {
            return cb(new Error('Only PDF or EPUB files are allowed for book content!'), false);
        }
    }
    cb(null, true);
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit
});

module.exports = upload;
