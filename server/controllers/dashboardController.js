const Content = require('../models/Content');
const Schedule = require('../models/Schedule');

exports.getDashboardStats = async (req, res, next) => {
  try {
    const { id: userId, role } = req.user;

    const stats = await Content.getStats(userId, role);
    const platformStats = await Content.getPlatformStats(userId, role);
    const recentContent = await Content.getRecentContent(5, userId, role);

    const normalizedStats = {
      total: Number(stats.total) || 0,
      draft: Number(stats.draft) || 0,
      pending_review: Number(stats.pending_review) || 0,
      approved: Number(stats.approved) || 0,
      scheduled: Number(stats.scheduled) || 0,
      published: Number(stats.published) || 0,
      rejected: Number(stats.rejected) || 0,
    };

    res.json({
      success: true,
      data: {
        stats: normalizedStats,
        platformStats,
        recentContent,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.getSchedule = async (req, res, next) => {
  try {
    const schedules = await Schedule.findAll();
    res.json({ success: true, data: { schedules } });
  } catch (error) {
    next(error);
  }
};
