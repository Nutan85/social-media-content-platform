const pool = require('../config/db');

const Content = {
  async findAll(filters = {}) {
    let query = `
      SELECT sc.*, u.name AS creator_name, u.email AS creator_email
      FROM social_contents sc
      JOIN users u ON sc.created_by = u.id
      WHERE 1=1
    `;
    const params = [];

    if (filters.status) {
      query += ' AND sc.status = ?';
      params.push(filters.status);
    }

    if (filters.platform) {
      query += ' AND sc.platform = ?';
      params.push(filters.platform);
    }

    if (filters.created_by) {
      query += ' AND sc.created_by = ?';
      params.push(filters.created_by);
    }

    if (filters.search) {
      query += ' AND (sc.title LIKE ? OR sc.caption LIKE ? OR sc.hashtags LIKE ?)';
      const searchTerm = `%${filters.search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    query += ' ORDER BY sc.updated_at DESC';

    const [rows] = await pool.execute(query, params);
    return rows;
  },

  async findById(id) {
    const [rows] = await pool.execute(
      `SELECT sc.*, u.name AS creator_name, u.email AS creator_email
       FROM social_contents sc
       JOIN users u ON sc.created_by = u.id
       WHERE sc.id = ?`,
      [id]
    );

    return rows[0] || null;
  },

  async create(data) {
    const {
      title,
      caption,
      media_url,
      platform,
      hashtags,
      status,
      scheduled_at,
      created_by
    } = data;

    const [result] = await pool.execute(
      `INSERT INTO social_contents
       (title, caption, media_url, platform, hashtags, status, scheduled_at, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title,
        caption,
        media_url || null,
        platform,
        hashtags || null,
        status || 'draft',
        scheduled_at || null,
        created_by
      ]
    );

    return this.findById(result.insertId);
  },

  async update(id, data) {
    const fields = [];
    const values = [];

    const allowedFields = [
      'title',
      'caption',
      'media_url',
      'platform',
      'hashtags',
      'status',
      'scheduled_at'
    ];

    for (const field of allowedFields) {
      if (data[field] !== undefined) {
        fields.push(`${field} = ?`);
        values.push(data[field]);
      }
    }

    if (fields.length === 0) {
      return this.findById(id);
    }

    values.push(id);

    await pool.execute(
      `UPDATE social_contents
       SET ${fields.join(', ')}
       WHERE id = ?`,
      values
    );

    return this.findById(id);
  },

  async delete(id) {
    const [result] = await pool.execute(
      'DELETE FROM social_contents WHERE id = ?',
      [id]
    );

    return result.affectedRows > 0;
  },

  async getStats(userId = null, role = null) {
    let query = `
      SELECT
        COUNT(*) AS total,
        SUM(CASE WHEN status = 'draft' THEN 1 ELSE 0 END) AS draft,
        SUM(CASE WHEN status = 'pending_review' THEN 1 ELSE 0 END) AS pending_review,
        SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) AS approved,
        SUM(CASE WHEN status = 'scheduled' THEN 1 ELSE 0 END) AS scheduled,
        SUM(CASE WHEN status = 'published' THEN 1 ELSE 0 END) AS published,
        SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) AS rejected
      FROM social_contents
    `;

    const params = [];

    if (role === 'content_creator' && userId) {
      query += ' WHERE created_by = ?';
      params.push(userId);
    }

    const [rows] = await pool.execute(query, params);
    return rows[0];
  },

  async getPlatformStats(userId = null, role = null) {
    let query = `
      SELECT platform, COUNT(*) AS count
      FROM social_contents
    `;

    const params = [];

    if (role === 'content_creator' && userId) {
      query += ' WHERE created_by = ?';
      params.push(userId);
    }

    query += ' GROUP BY platform ORDER BY count DESC';

    const [rows] = await pool.execute(query, params);
    return rows;
  },

  async getRecentContent(limit = 5, userId = null, role = null) {
    let query = `
      SELECT
        sc.id,
        sc.title,
        sc.platform,
        sc.status,
        sc.updated_at,
        u.name AS creator_name
      FROM social_contents sc
      JOIN users u ON sc.created_by = u.id
    `;

    const params = [];

    if (role === 'content_creator' && userId) {
      query += ' WHERE sc.created_by = ?';
      params.push(userId);
    }

    const safeLimit = Number(limit) || 5;
    query += ` ORDER BY sc.updated_at DESC LIMIT ${safeLimit}`;

    const [rows] = await pool.execute(query, params);
    return rows;
  }
};

module.exports = Content;