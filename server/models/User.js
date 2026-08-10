const pool = require('../config/db');

const User = {
  async findByEmail(email) {
    const [rows] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0] || null;
  },

  async findById(id) {
    const [rows] = await pool.execute(
      'SELECT id, name, email, role, created_at, updated_at FROM users WHERE id = ?',
      [id]
    );
    return rows[0] || null;
  },

  async create({ name, email, password, role = 'content_creator' }) {
    const [result] = await pool.execute(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name, email, password, role]
    );
    return this.findById(result.insertId);
  },

  async findAll() {
    const [rows] = await pool.execute(
      'SELECT id, name, email, role, created_at, updated_at FROM users ORDER BY created_at DESC'
    );
    return rows;
  },

  async update(id, { name, email, role }) {
    const fields = [];
    const values = [];

    if (name !== undefined) {
      fields.push('name = ?');
      values.push(name);
    }
    if (email !== undefined) {
      fields.push('email = ?');
      values.push(email);
    }
    if (role !== undefined) {
      fields.push('role = ?');
      values.push(role);
    }

    if (fields.length === 0) return this.findById(id);

    values.push(id);
    await pool.execute(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`, values);
    return this.findById(id);
  },

  async delete(id) {
    const [result] = await pool.execute('DELETE FROM users WHERE id = ?', [id]);
    return result.affectedRows > 0;
  },
};

module.exports = User;
