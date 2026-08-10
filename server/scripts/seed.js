const bcrypt = require('bcrypt');
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

async function seed() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    multipleStatements: true,
  });

  try {
    console.log('Running schema...');
    const schema = fs.readFileSync(path.join(__dirname, '../../database/schema.sql'), 'utf8');
    await connection.query(schema);

    console.log('Clearing existing data...');
    await connection.query('USE social_media_platform');
    await connection.query('SET FOREIGN_KEY_CHECKS = 0');
    await connection.query('TRUNCATE TABLE content_reviews');
    await connection.query('TRUNCATE TABLE publishing_schedule');
    await connection.query('TRUNCATE TABLE social_contents');
    await connection.query('TRUNCATE TABLE users');
    await connection.query('SET FOREIGN_KEY_CHECKS = 1');

    const password = await bcrypt.hash('Password123!', 10);

    console.log('Seeding users...');
    const users = [
      ['Admin User', 'admin@platform.com', password, 'admin'],
      ['Sarah Creator', 'sarah@platform.com', password, 'content_creator'],
      ['Mike Creator', 'mike@platform.com', password, 'content_creator'],
      ['Lisa Reviewer', 'lisa@platform.com', password, 'reviewer'],
      ['John Reviewer', 'john@platform.com', password, 'reviewer'],
    ];

    for (const user of users) {
      await connection.execute(
        'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
        user
      );
    }

    console.log('Seeding content...');
    const contents = [
      ['Summer Sale Announcement', 'Get ready for our biggest summer sale! Up to 50% off on all products.', 'https://images.example.com/summer-sale.jpg', 'instagram', '#SummerSale #Discount #Shopping', 'published', '2026-07-01 10:00:00', 2],
      ['Product Launch Teaser', 'Something exciting is coming next week! Stay tuned for our latest innovation.', 'https://images.example.com/product-teaser.jpg', 'facebook', '#NewProduct #Innovation #ComingSoon', 'scheduled', '2026-08-15 14:00:00', 2],
      ['Weekly Tips Thread', '5 productivity tips for remote workers: Set a routine, take breaks, stay connected.', null, 'twitter', '#Productivity #RemoteWork #Tips', 'approved', null, 3],
      ['Company Culture Post', 'We believe in fostering a culture of innovation and collaboration.', 'https://images.example.com/team-photo.jpg', 'linkedin', '#CompanyCulture #TeamWork', 'pending_review', null, 3],
      ['Tutorial Video Preview', 'Learn how to maximize your results with our step-by-step tutorial.', 'https://images.example.com/tutorial-thumb.jpg', 'youtube', '#Tutorial #HowTo', 'draft', null, 2],
      ['Customer Success Story', 'Hear from our customer who achieved 200% growth using our platform!', 'https://images.example.com/customer-story.jpg', 'linkedin', '#CustomerSuccess #Growth', 'rejected', null, 3],
      ['Behind the Scenes', 'Take a peek behind the curtain at our creative process!', 'https://images.example.com/bts.jpg', 'tiktok', '#BehindTheScenes #Creative', 'draft', null, 2],
      ['Holiday Campaign', 'Spread the joy this holiday season with our special collection!', 'https://images.example.com/holiday.jpg', 'instagram', '#Holiday #GiftIdeas', 'approved', null, 3],
    ];

    for (const content of contents) {
      await connection.execute(
        `INSERT INTO social_contents (title, caption, media_url, platform, hashtags, status, scheduled_at, created_by)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        content
      );
    }

    console.log('Seeding reviews...');
    const reviews = [
      [1, 4, 'approved', 'Great content! Approved for publishing.'],
      [6, 4, 'rejected', 'Needs more specific metrics and customer details. Please revise.'],
      [6, 5, 'rejected', 'The testimonial lacks credibility. Add verifiable results.'],
      [8, 5, 'approved', 'Excellent holiday campaign content. Ready for scheduling.'],
    ];

    for (const review of reviews) {
      await connection.execute(
        'INSERT INTO content_reviews (content_id, reviewer_id, status, comments) VALUES (?, ?, ?, ?)',
        review
      );
    }

    console.log('Seeding schedule...');
    await connection.execute(
      'INSERT INTO publishing_schedule (content_id, scheduled_at, published_at, status) VALUES (?, ?, ?, ?)',
      [1, '2026-07-01 10:00:00', '2026-07-01 10:05:00', 'published']
    );
    await connection.execute(
      'INSERT INTO publishing_schedule (content_id, scheduled_at, published_at, status) VALUES (?, ?, ?, ?)',
      [2, '2026-08-15 14:00:00', null, 'scheduled']
    );

    console.log('Database seeded successfully!');
    console.log('\nSample login credentials (password: Password123!):');
    console.log('  Admin:    admin@platform.com');
    console.log('  Creator:  sarah@platform.com');
    console.log('  Reviewer: lisa@platform.com');
  } catch (error) {
    console.error('Seed error:', error.message);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

seed();
