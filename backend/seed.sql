
-- Clear existing data
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE user;
TRUNCATE TABLE course;
TRUNCATE TABLE topic;
TRUNCATE TABLE question;
TRUNCATE TABLE recommendation;
SET FOREIGN_KEY_CHECKS = 1;

-- Users
INSERT INTO user (id, email, password, full_name, role) VALUES 
(1, 'admin@skgdp.com', '$2a$10$xyz', 'Super Admin', 'ADMIN'),
(2, 'faculty1@skgdp.com', '$2a$10$xyz', 'Dr. Sarah', 'FACULTY'),
(3, 'student1@skgdp.com', '$2a$10$xyz', 'John Doe', 'STUDENT'),
(4, 'student2@skgdp.com', '$2a$10$xyz', 'Jane Smith', 'STUDENT'),
(5, 'faculty2@skgdp.com', '$2a$10$xyz', 'Prof. Miller', 'FACULTY');

-- Courses
INSERT INTO course (id, title, description, code, faculty_id) VALUES 
(1, 'Data Structures', 'Mastering algorithmic complexity', 'CS101', 2),
(2, 'Database Systems', 'SQL and NoSQL paradigms', 'CS202', 5);

-- Topics
INSERT INTO topic (id, name, course_id) VALUES 
(1, 'Linked Lists', 1),
(2, 'Sorting', 1),
(3, 'Trees', 1),
(4, 'Indexing', 2),
(5, 'Normalization', 2);

-- Questions (Sample for Linked Lists)
INSERT INTO question (topic_id, content, option_a, option_b, option_c, option_d, correct_option, difficulty) VALUES 
(1, 'What is the time complexity of searching a linked list?', 'O(1)', 'O(n)', 'O(log n)', 'O(n^2)', 'B', 'MEDIUM'),
(1, 'Which structure uses LIFO?', 'Queue', 'Stack', 'Array', 'Heap', 'B', 'EASY'),
(2, 'Which sort is fastest on average?', 'Bubble', 'Merge', 'Selection', 'Insertion', 'B', 'MEDIUM'),
(5, 'What is 3NF?', 'Relation is in 2NF', 'No partial dep', 'No transitive dep', 'All are true', 'C', 'HARD');

-- Recommendations
INSERT INTO recommendation (topic_id, url, description, type) VALUES 
(1, 'https://youtube.com/list-master', 'Linked List Visualized', 'VIDEO'),
(1, 'https://geeksforgeeks.org/linked-list', 'Comprehensive LL Article', 'ARTICLE'),
(5, 'https://youtube.com/db-norm', 'Database Normalization Explained', 'VIDEO');
