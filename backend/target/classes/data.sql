-- SKGDP Seed Data

-- Users (password is 'password' for all)
INSERT INTO users (email, password, full_name, roll_number, role, avatar) VALUES 
('admin@skgdp.com', 'password', 'Super Admin', 'ADMIN001', 'ADMIN', 'SA'),
('faculty1@skgdp.com', 'password', 'Dr. Sarah Wilson', 'FAC001', 'FACULTY', 'SW'),
('faculty2@skgdp.com', 'password', 'Prof. James Miller', 'FAC002', 'FACULTY', 'JM'),
('john.doe@uni.edu', 'password', 'John Doe', 'STU001', 'STUDENT', 'JD'),
('jane.smith@uni.edu', 'password', 'Jane Smith', 'STU002', 'STUDENT', 'JS'),
('alice.wong@uni.edu', 'password', 'Alice Wong', 'STU003', 'STUDENT', 'AW'),
('bob.miller@uni.edu', 'password', 'Bob Miller', 'STU004', 'STUDENT', 'BM'),
('charlie.davis@uni.edu', 'password', 'Charlie Davis', 'STU005', 'STUDENT', 'CD')
ON DUPLICATE KEY UPDATE email=email;

-- Courses
INSERT INTO courses (id, title, description, code, faculty_id) VALUES 
(1, 'Data Structures & Algorithms', 'Core foundations of Computer Science including arrays, linked lists, trees, graphs, and algorithm analysis', 'CS101', 2),
(2, 'Database Management Systems', 'Relational database design, SQL, normalization, and transaction management', 'CS202', 3)
ON DUPLICATE KEY UPDATE id=id;

-- Topics
INSERT INTO topics (id, name, course_id) VALUES 
(1, 'Binary Trees', 1),
(2, 'Sorting Algorithms', 1),
(3, 'Dynamic Programming', 1),
(4, 'Linked Lists', 1),
(5, 'Normalization', 2),
(6, 'SQL Joins', 2),
(7, 'Indexing', 2)
ON DUPLICATE KEY UPDATE id=id;

-- Questions for Binary Trees
INSERT INTO questions (topic_id, content, option_a, option_b, option_c, option_d, correct_option, difficulty) VALUES 
(1, 'What is the maximum number of nodes at level L in a binary tree?', '2^L', '2^(L-1)', 'L^2', '2*L', 'A', 'MEDIUM'),
(1, 'In a min-heap, the root node contains...', 'Maximum value', 'Median value', 'Minimum value', 'Zero', 'C', 'EASY'),
(1, 'What is the time complexity of searching in a balanced BST?', 'O(n)', 'O(log n)', 'O(n^2)', 'O(1)', 'B', 'MEDIUM'),
(1, 'Which traversal visits nodes in Left-Root-Right order?', 'Preorder', 'Postorder', 'Inorder', 'Level order', 'C', 'EASY');

-- Questions for Sorting Algorithms
INSERT INTO questions (topic_id, content, option_a, option_b, option_c, option_d, correct_option, difficulty) VALUES 
(2, 'What is the worst-case time complexity of Quick Sort?', 'O(n log n)', 'O(n^2)', 'O(n)', 'O(log n)', 'B', 'MEDIUM'),
(2, 'Which sorting algorithm is stable?', 'Quick Sort', 'Heap Sort', 'Merge Sort', 'Selection Sort', 'C', 'MEDIUM'),
(2, 'What is the best-case time complexity of Bubble Sort?', 'O(n^2)', 'O(n log n)', 'O(n)', 'O(1)', 'C', 'EASY'),
(2, 'Which sort uses divide and conquer?', 'Bubble Sort', 'Insertion Sort', 'Merge Sort', 'Selection Sort', 'C', 'EASY');

-- Questions for Dynamic Programming
INSERT INTO questions (topic_id, content, option_a, option_b, option_c, option_d, correct_option, difficulty) VALUES 
(3, 'What are the two main properties of Dynamic Programming?', 'Greedy choice and optimal substructure', 'Overlapping subproblems and optimal substructure', 'Divide and conquer', 'None of the above', 'B', 'HARD'),
(3, 'Which approach builds solution bottom-up?', 'Memoization', 'Tabulation', 'Recursion', 'Backtracking', 'B', 'MEDIUM'),
(3, 'Time complexity of Fibonacci using DP?', 'O(2^n)', 'O(n^2)', 'O(n)', 'O(log n)', 'C', 'MEDIUM');

-- Questions for Linked Lists
INSERT INTO questions (topic_id, content, option_a, option_b, option_c, option_d, correct_option, difficulty) VALUES 
(4, 'What is the time complexity of searching a linked list?', 'O(1)', 'O(n)', 'O(log n)', 'O(n^2)', 'B', 'MEDIUM'),
(4, 'Which structure uses LIFO?', 'Queue', 'Stack', 'Array', 'Heap', 'B', 'EASY'),
(4, 'Advantage of linked list over array?', 'Random access', 'Dynamic size', 'Cache locality', 'Less memory', 'B', 'EASY');

-- Questions for Normalization
INSERT INTO questions (topic_id, content, option_a, option_b, option_c, option_d, correct_option, difficulty) VALUES 
(5, 'Which normal form deals with partial dependencies?', '1NF', '2NF', '3NF', 'BCNF', 'B', 'HARD'),
(5, 'A relation is in 1NF if...', 'No partial dependencies', 'Atomic values only', 'No transitive dependencies', 'All determinants are keys', 'B', 'MEDIUM'),
(5, '3NF eliminates which type of dependency?', 'Partial', 'Transitive', 'Functional', 'Multi-valued', 'B', 'HARD');

-- Questions for SQL Joins
INSERT INTO questions (topic_id, content, option_a, option_b, option_c, option_d, correct_option, difficulty) VALUES 
(6, 'Which join returns all records when there is a match in either table?', 'INNER JOIN', 'LEFT JOIN', 'FULL OUTER JOIN', 'CROSS JOIN', 'C', 'EASY'),
(6, 'CROSS JOIN produces...', 'All matching rows', 'Cartesian product', 'Null values', 'Distinct rows', 'B', 'MEDIUM'),
(6, 'LEFT JOIN returns...', 'Only matching rows', 'All left table rows plus matches', 'All right table rows', 'Cartesian product', 'B', 'EASY');

-- Questions for Indexing
INSERT INTO questions (topic_id, content, option_a, option_b, option_c, option_d, correct_option, difficulty) VALUES 
(7, 'B-Tree index is best for...', 'Range queries', 'Equality only', 'Full text search', 'Spatial data', 'A', 'MEDIUM'),
(7, 'Hash index provides...', 'O(log n) lookup', 'O(n) lookup', 'O(1) lookup', 'O(n^2) lookup', 'C', 'MEDIUM');

-- Recommendations
INSERT INTO recommendations (topic_id, url, description, type) VALUES 
(1, 'https://youtube.com/watch?v=binary-trees-explained', 'Mastering Binary Trees - Visual Guide', 'VIDEO'),
(1, 'https://www.geeksforgeeks.org/binary-tree-data-structure/', 'Comprehensive Binary Tree Tutorial', 'ARTICLE'),
(2, 'https://youtube.com/watch?v=sorting-visualized', 'Sorting Algorithms Visualized', 'VIDEO'),
(2, 'https://www.geeksforgeeks.org/sorting-algorithms/', 'Complete Guide to Sorting', 'ARTICLE'),
(3, 'https://youtube.com/watch?v=dp-tutorial', 'Dynamic Programming Made Easy', 'VIDEO'),
(4, 'https://youtube.com/watch?v=linked-list-master', 'Linked List Visualized', 'VIDEO'),
(5, 'https://youtube.com/watch?v=db-normalization', 'Database Normalization Explained', 'VIDEO'),
(5, 'https://www.geeksforgeeks.org/database-normalization/', 'Guide to 2NF and 3NF', 'ARTICLE'),
(6, 'https://youtube.com/watch?v=sql-joins', 'SQL Joins Masterclass', 'VIDEO'),
(7, 'https://www.geeksforgeeks.org/indexing-in-databases/', 'Database Indexing Deep Dive', 'ARTICLE');
