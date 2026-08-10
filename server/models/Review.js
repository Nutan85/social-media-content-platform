const pool = require('../config/db');

const Review = {
  async findByContentId(contentId) {
    const [rows] = await pool.execute(
      `SELECT cr.*, u.name AS reviewer_name
       FROM content_reviews cr
       JOIN users u ON cr.reviewer_id = u.id
       WHERE cr.content_id = ?
       ORDER BY cr.reviewed_at DESC`,
      [contentId]
    );
    return rows;
  },

  async create({ content_id, reviewer_id, status, comments }) {
    const [result] = await pool.execute(
      'INSERT INTO content_reviews (content_id, reviewer_id, status, comments) VALUES (?, ?, ?, ?)',
      [content_id, reviewer_id, status, comments || null]
    );
    const [rows] = await pool.execute(
      `SELECT cr.*, u.name AS reviewer_name
       FROM content_reviews cr
       JOIN users u ON cr.reviewer_id = u.id
       WHERE cr.id = ?`,
      [result.insertId]
    );
    return rows[0];
  },

  async findPendingContent() {
    const [rows] = await pool.execute(
      `SELECT sc.*, u.name AS creator_name
       FROM social_contents sc
       JOIN users u ON sc.created_by = u.id
       WHERE sc.status = 'pending_review'
       ORDER BY sc.updated_at ASC`
    );
    return rows;
  },
};

module.exports = Review;
