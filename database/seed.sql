-- Seed data for Social Media Content Platform
-- Password for all users: Password123!
-- bcrypt hash generated with cost factor 10

USE social_media_platform;

-- Sample users (password: Password123!)
INSERT INTO users (name, email, password, role) VALUES
('Admin User', 'admin@platform.com', '$2b$10$rQZ8K5YvXmN3pL2wJ1hG.uGK8vN4mP6qR9sT0uV1wX2yZ3aB4cD5e', 'admin'),
('Sarah Creator', 'sarah@platform.com', '$2b$10$rQZ8K5YvXmN3pL2wJ1hG.uGK8vN4mP6qR9sT0uV1wX2yZ3aB4cD5e', 'content_creator'),
('Mike Creator', 'mike@platform.com', '$2b$10$rQZ8K5YvXmN3pL2wJ1hG.uGK8vN4mP6qR9sT0uV1wX2yZ3aB4cD5e', 'content_creator'),
('Lisa Reviewer', 'lisa@platform.com', '$2b$10$rQZ8K5YvXmN3pL2wJ1hG.uGK8vN4mP6qR9sT0uV1wX2yZ3aB4cD5e', 'reviewer'),
('John Reviewer', 'john@platform.com', '$2b$10$rQZ8K5YvXmN3pL2wJ1hG.uGK8vN4mP6qR9sT0uV1wX2yZ3aB4cD5e', 'reviewer');

-- Sample social content
INSERT INTO social_contents (title, caption, media_url, platform, hashtags, status, scheduled_at, created_by) VALUES
('Summer Sale Announcement', 'Get ready for our biggest summer sale! Up to 50% off on all products. Shop now and save big! 🌞', 'https://images.example.com/summer-sale.jpg', 'instagram', '#SummerSale #Discount #Shopping', 'published', '2026-07-01 10:00:00', 2),
('Product Launch Teaser', 'Something exciting is coming next week! Stay tuned for our latest innovation that will change the game.', 'https://images.example.com/product-teaser.jpg', 'facebook', '#NewProduct #Innovation #ComingSoon', 'scheduled', '2026-08-15 14:00:00', 2),
('Weekly Tips Thread', '5 productivity tips for remote workers:\n1. Set a routine\n2. Take breaks\n3. Stay connected\n4. Create a workspace\n5. Set boundaries', NULL, 'twitter', '#Productivity #RemoteWork #Tips', 'approved', NULL, 3),
('Company Culture Post', 'We believe in fostering a culture of innovation and collaboration. Meet our amazing team!', 'https://images.example.com/team-photo.jpg', 'linkedin', '#CompanyCulture #TeamWork #Innovation', 'pending_review', NULL, 3),
('Tutorial Video Preview', 'Learn how to maximize your results with our step-by-step tutorial. Link in bio!', 'https://images.example.com/tutorial-thumb.jpg', 'youtube', '#Tutorial #HowTo #Learning', 'draft', NULL, 2),
('Customer Success Story', 'Hear from our customer who achieved 200% growth using our platform!', 'https://images.example.com/customer-story.jpg', 'linkedin', '#CustomerSuccess #Growth #Testimonial', 'rejected', NULL, 3),
('Behind the Scenes', 'Take a peek behind the curtain at our creative process! 🎬', 'https://images.example.com/bts.jpg', 'tiktok', '#BehindTheScenes #Creative #BTS', 'draft', NULL, 2),
('Holiday Campaign', 'Spread the joy this holiday season with our special collection!', 'https://images.example.com/holiday.jpg', 'instagram', '#Holiday #GiftIdeas #Season', 'approved', NULL, 3);

-- Sample content reviews
INSERT INTO content_reviews (content_id, reviewer_id, status, comments) VALUES
(1, 4, 'approved', 'Great content! Approved for publishing.'),
(6, 4, 'rejected', 'Needs more specific metrics and customer details. Please revise.'),
(6, 5, 'rejected', 'The testimonial lacks credibility. Add verifiable results.'),
(8, 5, 'approved', 'Excellent holiday campaign content. Ready for scheduling.');

-- Sample publishing schedule
INSERT INTO publishing_schedule (content_id, scheduled_at, published_at, status) VALUES
(1, '2026-07-01 10:00:00', '2026-07-01 10:05:00', 'published'),
(2, '2026-08-15 14:00:00', NULL, 'scheduled');
