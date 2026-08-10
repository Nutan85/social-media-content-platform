const Content = require('../models/Content');
const Review = require('../models/Review');
const { canTransition } = require('../services/validation');

exports.getPendingReviews = async (req, res, next) => {
  try {
    const contents = await Review.findPendingContent();
    res.json({ success: true, data: { contents } });
  } catch (error) {
    next(error);
  }
};

exports.getReviewsByContent = async (req, res, next) => {
  try {
    const contentId = parseInt(req.params.contentId, 10);
    const content = await Content.findById(contentId);

    if (!content) {
      return res.status(404).json({ success: false, message: 'Content not found.' });
    }

    const reviews = await Review.findByContentId(contentId);
    res.json({ success: true, data: { reviews } });
  } catch (error) {
    next(error);
  }
};

exports.approveContent = async (req, res, next) => {
  try {
    const contentId = parseInt(req.params.contentId, 10);
    const { comments } = req.body;

    const content = await Content.findById(contentId);
    if (!content) {
      return res.status(404).json({ success: false, message: 'Content not found.' });
    }

    if (content.status !== 'pending_review') {
      return res.status(400).json({
        success: false,
        message: `Cannot approve content with status '${content.status}'.`,
      });
    }

    if (!canTransition(content.status, 'approved')) {
      return res.status(400).json({ success: false, message: 'Invalid status transition.' });
    }

    await Review.create({
      content_id: contentId,
      reviewer_id: req.user.id,
      status: 'approved',
      comments,
    });

    const updatedContent = await Content.update(contentId, { status: 'approved' });

    res.json({
      success: true,
      message: 'Content approved successfully.',
      data: { content: updatedContent },
    });
  } catch (error) {
    next(error);
  }
};

exports.rejectContent = async (req, res, next) => {
  try {
    const contentId = parseInt(req.params.contentId, 10);
    const { comments } = req.body;

    if (!comments || comments.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'Rejection comments are required.' });
    }

    const content = await Content.findById(contentId);
    if (!content) {
      return res.status(404).json({ success: false, message: 'Content not found.' });
    }

    if (content.status !== 'pending_review') {
      return res.status(400).json({
        success: false,
        message: `Cannot reject content with status '${content.status}'.`,
      });
    }

    await Review.create({
      content_id: contentId,
      reviewer_id: req.user.id,
      status: 'rejected',
      comments,
    });

    const updatedContent = await Content.update(contentId, { status: 'rejected' });

    res.json({
      success: true,
      message: 'Content rejected.',
      data: { content: updatedContent },
    });
  } catch (error) {
    next(error);
  }
};
