const Content = require('../models/Content');
const Schedule = require('../models/Schedule');
const { validateContentData, canTransition } = require('../services/validation');

exports.getAllContent = async (req, res, next) => {
  try {
    const filters = {};

    if (req.query.status) filters.status = req.query.status;
    if (req.query.platform) filters.platform = req.query.platform;
    if (req.query.search) filters.search = req.query.search;

    if (req.user.role === 'content_creator') {
      filters.created_by = req.user.id;
    }

    const contents = await Content.findAll(filters);
    res.json({ success: true, data: { contents } });
  } catch (error) {
    next(error);
  }
};

exports.getContentById = async (req, res, next) => {
  try {
    const content = await Content.findById(req.params.id);
    if (!content) {
      return res.status(404).json({ success: false, message: 'Content not found.' });
    }

    if (req.user.role === 'content_creator' && content.created_by !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    res.json({ success: true, data: { content } });
  } catch (error) {
    next(error);
  }
};

exports.createContent = async (req, res, next) => {
  try {
    const errors = validateContentData(req.body);
    if (errors.length > 0) {
      return res.status(400).json({ success: false, message: errors.join(', ') });
    }

    const content = await Content.create({
      ...req.body,
      status: req.body.status || 'draft',
      created_by: req.user.id,
    });

    res.status(201).json({ success: true, message: 'Content created successfully.', data: { content } });
  } catch (error) {
    next(error);
  }
};

exports.updateContent = async (req, res, next) => {
  try {
    const contentId = parseInt(req.params.id, 10);
    const existing = await Content.findById(contentId);

    if (!existing) {
      return res.status(404).json({ success: false, message: 'Content not found.' });
    }

    if (req.user.role === 'content_creator' && existing.created_by !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    const errors = validateContentData(req.body, true);
    if (errors.length > 0) {
      return res.status(400).json({ success: false, message: errors.join(', ') });
    }

    if (req.body.status && req.body.status !== existing.status) {
      if (req.user.role === 'content_creator') {
        const creatorAllowed = ['draft', 'pending_review'];
        if (!creatorAllowed.includes(req.body.status)) {
          return res.status(403).json({
            success: false,
            message: 'Content creators can only set status to draft or pending_review.',
          });
        }
      }

      if (!canTransition(existing.status, req.body.status)) {
        return res.status(400).json({
          success: false,
          message: `Invalid status transition from '${existing.status}' to '${req.body.status}'.`,
        });
      }
    }

    const content = await Content.update(contentId, req.body);
    res.json({ success: true, message: 'Content updated successfully.', data: { content } });
  } catch (error) {
    next(error);
  }
};

exports.deleteContent = async (req, res, next) => {
  try {
    const contentId = parseInt(req.params.id, 10);
    const existing = await Content.findById(contentId);

    if (!existing) {
      return res.status(404).json({ success: false, message: 'Content not found.' });
    }

    if (req.user.role === 'content_creator' && existing.created_by !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    await Content.delete(contentId);
    res.json({ success: true, message: 'Content deleted successfully.' });
  } catch (error) {
    next(error);
  }
};

exports.submitForReview = async (req, res, next) => {
  try {
    const contentId = parseInt(req.params.id, 10);
    const existing = await Content.findById(contentId);

    if (!existing) {
      return res.status(404).json({ success: false, message: 'Content not found.' });
    }

    if (req.user.role === 'content_creator' && existing.created_by !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    if (!canTransition(existing.status, 'pending_review')) {
      return res.status(400).json({
        success: false,
        message: `Cannot submit content with status '${existing.status}' for review.`,
      });
    }

    const content = await Content.update(contentId, { status: 'pending_review' });
    res.json({ success: true, message: 'Content submitted for review.', data: { content } });
  } catch (error) {
    next(error);
  }
};

exports.scheduleContent = async (req, res, next) => {
  try {
    const contentId = parseInt(req.params.id, 10);
    const { scheduled_at } = req.body;

    if (!scheduled_at) {
      return res.status(400).json({ success: false, message: 'Scheduled date/time is required.' });
    }

    const existing = await Content.findById(contentId);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Content not found.' });
    }

    if (!canTransition(existing.status, 'scheduled')) {
      return res.status(400).json({
        success: false,
        message: `Cannot schedule content with status '${existing.status}'. Content must be approved first.`,
      });
    }

    await Content.update(contentId, { status: 'scheduled', scheduled_at });

    const existingSchedule = await Schedule.findByContentId(contentId);
    if (existingSchedule) {
      await Schedule.update(contentId, { scheduled_at, status: 'scheduled' });
    } else {
      await Schedule.create({ content_id: contentId, scheduled_at });
    }

    const content = await Content.findById(contentId);
    res.json({ success: true, message: 'Content scheduled successfully.', data: { content } });
  } catch (error) {
    next(error);
  }
};

exports.publishContent = async (req, res, next) => {
  try {
    const contentId = parseInt(req.params.id, 10);
    const existing = await Content.findById(contentId);

    if (!existing) {
      return res.status(404).json({ success: false, message: 'Content not found.' });
    }

    if (!canTransition(existing.status, 'published')) {
      return res.status(400).json({
        success: false,
        message: `Cannot publish content with status '${existing.status}'.`,
      });
    }

    const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
    await Content.update(contentId, { status: 'published' });

    const existingSchedule = await Schedule.findByContentId(contentId);
    if (existingSchedule) {
      await Schedule.update(contentId, { status: 'published', published_at: now });
    }

    const content = await Content.findById(contentId);
    res.json({ success: true, message: 'Content published successfully.', data: { content } });
  } catch (error) {
    next(error);
  }
};
