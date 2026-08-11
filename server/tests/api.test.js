/** @jest-environment node */
const request = require('supertest');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

process.env.JWT_SECRET = 'test_secret_key_for_jest';
process.env.JWT_EXPIRES_IN = '1h';

jest.mock('../config/db', () => {
  const users = [];
  const contents = [];
  let userIdCounter = 4;
  let contentIdCounter = 1;

  const pool = {
    execute: jest.fn(async (query, params = []) => {
      const q = query.replace(/\s+/g, ' ').trim().toLowerCase();

      if (q.includes('select * from users where email')) {
        const user = users.find((u) => u.email === params[0]);
        return [user ? [user] : []];
      }

      if (
        q.includes('select id, name, email, role') &&
        q.includes('from users where id')
      ) {
        const user = users.find((u) => u.id === params[0]);

        if (!user) return [[]];

        const { password, ...rest } = user;
        return [[rest]];
      }

      if (q.includes('insert into users')) {
        const user = {
          id: userIdCounter++,
          name: params[0],
          email: params[1],
          password: params[2],
          role: params[3],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        users.push(user);

        return [{ insertId: user.id }];
      }

      if (q.includes('insert into social_contents')) {
        const content = {
          id: contentIdCounter++,
          title: params[0],
          caption: params[1],
          media_url: params[2],
          platform: params[3],
          hashtags: params[4],
          status: params[5],
          scheduled_at: params[6],
          created_by: params[7],
          creator_name:
            users.find((u) => u.id === params[7])?.name || 'Test User',
          creator_email:
            users.find((u) => u.id === params[7])?.email || 'test@test.com',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        contents.push(content);

        return [{ insertId: content.id }];
      }

      if (
        q.includes('from social_contents sc') &&
        q.includes('where sc.id')
      ) {
        const content = contents.find((c) => c.id === params[0]);
        return [content ? [content] : []];
      }

      if (
        q.includes('from social_contents sc') &&
        q.includes('where 1=1')
      ) {
        return [contents];
      }

      // UPDATE CONTENT MOCK
      if (q.includes('update social_contents set')) {
        const content = contents.find(
          (c) => c.id === params[params.length - 1]
        );

        if (content) {
          const fields = [];

          if (q.includes('title = ?')) fields.push('title');
          if (q.includes('caption = ?')) fields.push('caption');
          if (q.includes('media_url = ?')) fields.push('media_url');
          if (q.includes('platform = ?')) fields.push('platform');
          if (q.includes('hashtags = ?')) fields.push('hashtags');
          if (q.includes('status = ?')) fields.push('status');
          if (q.includes('scheduled_at = ?')) fields.push('scheduled_at');

          fields.forEach((field, index) => {
            content[field] = params[index];
          });

          content.updated_at = new Date().toISOString();
        }

        return [{ affectedRows: content ? 1 : 0 }];
      }

      if (q.includes('delete from social_contents')) {
        const idx = contents.findIndex((c) => c.id === params[0]);

        if (idx >= 0) {
          contents.splice(idx, 1);
        }

        return [{ affectedRows: idx >= 0 ? 1 : 0 }];
      }

      if (q.includes('count(*) as total')) {
        return [
          [
            {
              total: contents.length,
              draft: contents.filter((c) => c.status === 'draft').length,
              pending_review: contents.filter(
                (c) => c.status === 'pending_review'
              ).length,
              approved: contents.filter((c) => c.status === 'approved')
                .length,
              scheduled: contents.filter((c) => c.status === 'scheduled')
                .length,
              published: contents.filter((c) => c.status === 'published')
                .length,
              rejected: contents.filter((c) => c.status === 'rejected')
                .length,
            },
          ],
        ];
      }

      if (q.includes('group by platform')) {
        return [[]];
      }

      if (q.includes('order by sc.updated_at desc limit')) {
        return [contents.slice(0, params[params.length - 1])];
      }

      if (q.includes("where sc.status = 'pending_review'")) {
        return [contents.filter((c) => c.status === 'pending_review')];
      }

      if (q.includes('insert into content_reviews')) {
        return [{ insertId: 1 }];
      }

      if (q.includes('from content_reviews')) {
        return [[]];
      }

      if (
        q.includes('select id, name, email, role') &&
        q.includes('from users order by')
      ) {
        return [users.map(({ password, ...u }) => u)];
      }

      return [[]];
    }),

    _users: users,
    _contents: contents,
  };

  return pool;
});

const app = require('../server');
const pool = require('../config/db');

const generateToken = (user) =>
  jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: '1h',
    }
  );

describe('Social Media Content Platform API', () => {
  let adminToken;
  let creatorToken;
  let reviewerToken;

  let adminUser;
  let creatorUser;
  let reviewerUser;

  beforeAll(async () => {
    const hashedPassword = await bcrypt.hash('Password123!', 10);

    adminUser = {
      id: 1,
      name: 'Admin',
      email: 'admin@test.com',
      password: hashedPassword,
      role: 'admin',
    };

    creatorUser = {
      id: 2,
      name: 'Creator',
      email: 'creator@test.com',
      password: hashedPassword,
      role: 'content_creator',
    };

    reviewerUser = {
      id: 3,
      name: 'Reviewer',
      email: 'reviewer@test.com',
      password: hashedPassword,
      role: 'reviewer',
    };

    pool._users.push(adminUser, creatorUser, reviewerUser);

    adminToken = generateToken(adminUser);
    creatorToken = generateToken(creatorUser);
    reviewerToken = generateToken(reviewerUser);
  });

  describe('Authentication', () => {
    test('POST /api/auth/register - should register a new user', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'New User',
          email: 'newuser@test.com',
          password: 'Password123!',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBeDefined();
      expect(res.body.data.user.email).toBe('newuser@test.com');
    });

    test('POST /api/auth/register - should reject duplicate email', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Duplicate',
          email: 'admin@test.com',
          password: 'Password123!',
        });

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
    });

    test('POST /api/auth/register - should reject invalid email', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Bad Email',
          email: 'invalid',
          password: 'Password123!',
        });

      expect(res.status).toBe(400);
    });

    test('POST /api/auth/register - should reject short password', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Short Pass',
          email: 'short@test.com',
          password: '123',
        });

      expect(res.status).toBe(400);
    });

    test('POST /api/auth/login - should login with valid credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'admin@test.com',
          password: 'Password123!',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBeDefined();
    });

    test('POST /api/auth/login - should reject invalid login', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'admin@test.com',
          password: 'WrongPassword!',
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    test('GET /api/auth/profile - should return profile with valid token', async () => {
      const res = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.user.email).toBe('admin@test.com');
    });

    test('GET /api/auth/profile - should reject without token', async () => {
      const res = await request(app).get('/api/auth/profile');

      expect(res.status).toBe(401);
    });
  });

  describe('Content Management', () => {
    let contentId;

    test('POST /api/content - should create content', async () => {
      const res = await request(app)
        .post('/api/content')
        .set('Authorization', `Bearer ${creatorToken}`)
        .send({
          title: 'Test Post',
          caption: 'This is a test caption',
          platform: 'instagram',
          hashtags: '#test',
        });

      expect(res.status).toBe(201);
      expect(res.body.data.content.title).toBe('Test Post');

      contentId = res.body.data.content.id;
    });

    test('POST /api/content - should reject missing required fields', async () => {
      const res = await request(app)
        .post('/api/content')
        .set('Authorization', `Bearer ${creatorToken}`)
        .send({
          title: 'Missing fields',
        });

      expect(res.status).toBe(400);
    });

    test('GET /api/content - should list content', async () => {
      const res = await request(app)
        .get('/api/content')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data.contents)).toBe(true);
    });

    test('PUT /api/content/:id - should update content', async () => {
      const res = await request(app)
        .put(`/api/content/${contentId}`)
        .set('Authorization', `Bearer ${creatorToken}`)
        .send({
          title: 'Updated Post',
        });

      expect(res.status).toBe(200);
      expect(res.body.data.content.title).toBe('Updated Post');
    });

    test('POST /api/content/:id/submit - should submit for review', async () => {
      const res = await request(app)
        .post(`/api/content/${contentId}/submit`)
        .set('Authorization', `Bearer ${creatorToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.content.status).toBe('pending_review');
    });

    test('DELETE /api/content/:id - should delete content', async () => {
      const createRes = await request(app)
        .post('/api/content')
        .set('Authorization', `Bearer ${creatorToken}`)
        .send({
          title: 'To Delete',
          caption: 'Delete me',
          platform: 'twitter',
        });

      const deleteId = createRes.body.data.content.id;

      const res = await request(app)
        .delete(`/api/content/${deleteId}`)
        .set('Authorization', `Bearer ${creatorToken}`);

      expect(res.status).toBe(200);
    });
  });

  describe('Reviews', () => {
    let reviewContentId;

    beforeAll(async () => {
      const res = await request(app)
        .post('/api/content')
        .set('Authorization', `Bearer ${creatorToken}`)
        .send({
          title: 'Review Test',
          caption: 'Review this',
          platform: 'facebook',
        });

      reviewContentId = res.body.data.content.id;

      await request(app)
        .post(`/api/content/${reviewContentId}/submit`)
        .set('Authorization', `Bearer ${creatorToken}`);
    });

    test('GET /api/reviews/pending - should list pending reviews', async () => {
      const res = await request(app)
        .get('/api/reviews/pending')
        .set('Authorization', `Bearer ${reviewerToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data.contents)).toBe(true);
    });

    test('POST /api/reviews/:id/approve - should approve content', async () => {
      const res = await request(app)
        .post(`/api/reviews/${reviewContentId}/approve`)
        .set('Authorization', `Bearer ${reviewerToken}`)
        .send({
          comments: 'Looks good!',
        });

      expect(res.status).toBe(200);
      expect(res.body.data.content.status).toBe('approved');
    });

    test('POST /api/reviews/:id/reject - should reject content', async () => {
      const createRes = await request(app)
        .post('/api/content')
        .set('Authorization', `Bearer ${creatorToken}`)
        .send({
          title: 'Reject Test',
          caption: 'Reject this',
          platform: 'linkedin',
        });

      const rejectId = createRes.body.data.content.id;

      await request(app)
        .post(`/api/content/${rejectId}/submit`)
        .set('Authorization', `Bearer ${creatorToken}`);

      const res = await request(app)
        .post(`/api/reviews/${rejectId}/reject`)
        .set('Authorization', `Bearer ${reviewerToken}`)
        .send({
          comments: 'Needs improvement',
        });

      expect(res.status).toBe(200);
      expect(res.body.data.content.status).toBe('rejected');
    });

    test('POST /api/reviews/:id/reject - should require comments', async () => {
      const res = await request(app)
        .post(`/api/reviews/${reviewContentId}/reject`)
        .set('Authorization', `Bearer ${reviewerToken}`)
        .send({
          comments: '',
        });

      expect(res.status).toBe(400);
    });
  });

  describe('Role-Based Authorization', () => {
    test('Content creator cannot access user management', async () => {
      const res = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${creatorToken}`);

      expect(res.status).toBe(403);
    });

    test('Reviewer cannot create content', async () => {
      const res = await request(app)
        .post('/api/content')
        .set('Authorization', `Bearer ${reviewerToken}`)
        .send({
          title: 'Blocked',
          caption: 'No access',
          platform: 'twitter',
        });

      expect(res.status).toBe(403);
    });

    test('Admin can access user management', async () => {
      const res = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
    });
  });

  describe('Dashboard', () => {
    test('GET /api/dashboard/stats - should return statistics', async () => {
      const res = await request(app)
        .get('/api/dashboard/stats')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.stats).toBeDefined();
      expect(res.body.data.stats.total).toBeDefined();
    });
  });
});