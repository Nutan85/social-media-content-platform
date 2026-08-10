const express = require('express');
const router = express.Router();
const contentController = require('../controllers/contentController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

router.get('/', contentController.getAllContent);
router.get('/:id', contentController.getContentById);
router.post('/', authorize('admin', 'content_creator'), contentController.createContent);
router.put('/:id', authorize('admin', 'content_creator'), contentController.updateContent);
router.delete('/:id', authorize('admin', 'content_creator'), contentController.deleteContent);
router.post('/:id/submit', authorize('admin', 'content_creator'), contentController.submitForReview);
router.post('/:id/schedule', authorize('admin', 'content_creator'), contentController.scheduleContent);
router.post('/:id/publish', authorize('admin'), contentController.publishContent);

module.exports = router;
