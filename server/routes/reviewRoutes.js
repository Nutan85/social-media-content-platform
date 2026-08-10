const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

router.get(
  '/pending',
  authorize('admin', 'reviewer'),
  reviewController.getPendingReviews
);

router.get(
  '/:contentId',
  reviewController.getReviewsByContent
);

router.post(
  '/:contentId/approve',
  authorize('admin', 'reviewer'),
  reviewController.approveContent
);

router.post(
  '/:contentId/reject',
  authorize('admin', 'reviewer'),
  reviewController.rejectContent
);

module.exports = router;