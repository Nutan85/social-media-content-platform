const pool = require('../config/db');

const Schedule = {
  async findByContentId(contentId) {
    const [rows] = await pool.execute(
      'SELECT * FROM publishing_schedule WHERE content_id = ?',
      [contentId]
    );
    return rows[0] || null;
  },

  async create({ content_id, scheduled_at }) {
    const [result] = await pool.execute(
      'INSERT INTO publishing_schedule (content_id, scheduled_at, status) VALUES (?, ?, ?)',
      [content_id, scheduled_at, 'scheduled']
    );
    const [rows] = await pool.execute(
      'SELECT * FROM publishing_schedule WHERE id = ?',
      [result.insertId]
    );
    return rows[0];
  },

  async update(contentId, data) {
    const fields = [];
    const values = [];

    if (data.scheduled_at !== undefined) {
      fields.push('scheduled_at = ?');
      values.push(data.scheduled_at);
    }
    if (data.published_at !== undefined) {
      fields.push('published_at = ?');
      values.push(data.published_at);
    }
    if (data.status !== undefined) {
      fields.push('status = ?');
      values.push(data.status);
    }

    if (fields.length === 0) return this.findByContentId(contentId);

    values.push(contentId);
    await pool.execute(
      `UPDATE publishing_schedule SET ${fields.join(', ')} WHERE content_id = ?`,
      values
    );
    return this.findByContentId(contentId);
  },

  async delete(contentId) {
    const [result] = await pool.execute(
      'DELETE FROM publishing_schedule WHERE content_id = ?',
      [contentId]
    );
    return result.affectedRows > 0;
  },

  async findAll() {
    const [rows] = await pool.execute(
      `SELECT ps.*, sc.title, sc.platform, u.name AS creator_name
       FROM publishing_schedule ps
       JOIN social_contents sc ON ps.content_id = sc.id
       JOIN users u ON sc.created_by = u.id
       ORDER BY ps.scheduled_at ASC`
    );
    return rows;
  },
};

module.exports = Schedule;
