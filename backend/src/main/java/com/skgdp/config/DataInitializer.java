package com.skgdp.config;

import com.skgdp.entity.*;
import com.skgdp.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.List;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

        private final UserRepository userRepo;
        private final CourseRepository courseRepo;
        private final TopicRepository topicRepo;
        private final QuestionRepository questionRepo;
        private final RecommendationRepository recRepo;
        private final PracticeQuestionRepository practiceQuestionRepo;

        @Override
        public void run(String... args) {

                if (userRepo.count() > 0) {
                        // Even if users exist, seed practice questions
                        seedPracticeQuestionsIfNeeded();
                        return;
                }

                // ---------- USERS ----------
                User admin = userRepo.save(User.builder()
                                .email("admin@skgdp.com")
                                .password("admin123")
                                .fullName("System Admin")
                                .role(User.Role.ADMIN)
                                .avatar("SA")
                                .build());

                User faculty = userRepo.save(User.builder()
                                .email("john.smith@skgdp.com")
                                .password("faculty123")
                                .fullName("John Smith")
                                .role(User.Role.FACULTY)
                                .avatar("JS")
                                .build());

                User student = userRepo.save(User.builder()
                                .email("rahul.kumar@skgdp.com")
                                .password("student123")
                                .fullName("Rahul Kumar")
                                .rollNumber("CS2021001")
                                .role(User.Role.STUDENT)
                                .avatar("RK")
                                .build());

                // ---------- COURSES ----------
                Course dsa = courseRepo.save(Course.builder()
                                .title("Data Structures & Algorithms")
                                .code("CS201")
                                .description("Core data structures and algorithms")
                                .faculty(faculty)
                                .build());

                Course dbms = courseRepo.save(Course.builder()
                                .title("Database Management Systems")
                                .code("CS301")
                                .description("Relational databases and SQL")
                                .faculty(faculty)
                                .build());

                // ---------- TOPICS ----------
                Topic arrays = topicRepo.save(Topic.builder()
                                .name("Arrays")
                                .course(dsa)
                                .build());

                Topic sql = topicRepo.save(Topic.builder()
                                .name("SQL Basics")
                                .course(dbms)
                                .build());

                // ---------- QUESTIONS ----------
                questionRepo.saveAll(List.of(
                                Question.builder()
                                                .content("What is the time complexity of array access by index?")
                                                .optionA("O(1)")
                                                .optionB("O(n)")
                                                .optionC("O(log n)")
                                                .optionD("O(n²)")
                                                .correctOption("A")
                                                .difficulty(Question.Difficulty.EASY)
                                                .topic(arrays)
                                                .build(),

                                Question.builder()
                                                .content("Which SQL command retrieves data?")
                                                .optionA("INSERT")
                                                .optionB("UPDATE")
                                                .optionC("SELECT")
                                                .optionD("DELETE")
                                                .correctOption("C")
                                                .difficulty(Question.Difficulty.EASY)
                                                .topic(sql)
                                                .build()));

                // ---------- RECOMMENDATIONS ----------
                recRepo.saveAll(List.of(
                                Recommendation.builder()
                                                .topic(arrays)
                                                .url("https://www.geeksforgeeks.org/array-data-structure/")
                                                .description("Array data structure explained")
                                                .type(Recommendation.Type.ARTICLE)
                                                .build(),

                                Recommendation.builder()
                                                .topic(arrays)
                                                .url("https://www.youtube.com/watch?v=QJvmkR1JKo0")
                                                .description("Arrays video tutorial")
                                                .type(Recommendation.Type.VIDEO)
                                                .build()));

                // Seed practice questions after all entities are created
                seedPracticeQuestionsIfNeeded();

                System.out.println("✅ Database initialized successfully");
        }

        private void seedPracticeQuestionsIfNeeded() {
                // Clear existing and re-seed practice questions
                practiceQuestionRepo.deleteAll();

                // Fetch existing entities
                Topic arrays = topicRepo.findByName("Arrays").orElse(null);
                Topic sql = topicRepo.findByName("SQL Basics").orElse(null);
                Course dsa = courseRepo.findByCode("CS201").orElse(null);
                Course dbms = courseRepo.findByCode("CS301").orElse(null);
                User faculty = userRepo.findByEmail("john.smith@skgdp.com").orElse(null);

                if (arrays == null || sql == null || dsa == null || dbms == null || faculty == null) {
                        System.out.println("⚠️ Cannot seed practice questions - required entities not found");
                        return;
                }

                // ---------- PRACTICE QUESTIONS FOR ARRAYS ----------
                practiceQuestionRepo.saveAll(List.of(
                                PracticeQuestion.builder()
                                                .title("Two Sum Problem")
                                                .description("Find two numbers that add up to a target")
                                                .topic(arrays)
                                                .course(dsa)
                                                .difficulty(PracticeQuestion.DifficultyLevel.EASY)
                                                .type(PracticeQuestion.QuestionType.CODING)
                                                .problemStatement(
                                                                "Merge nums1 and nums2 into a single sorted array. nums1 has enough space at the end.\n\nExample:\nInput: nums1 = [1,2,3,0,0,0], m = 3, nums2 = [2,5,6], n = 3\nOutput: [1,2,2,3,5,6]")
                                                .hints(Arrays.asList("Start from the end of both arrays",
                                                                "Fill nums1 from the back"))
                                                .solution("public void merge(int[] nums1, int m, int[] nums2, int n) {\n    int i = m - 1, j = n - 1, k = m + n - 1;\n    while (j >= 0) {\n        if (i >= 0 && nums1[i] > nums2[j]) {\n            nums1[k--] = nums1[i--];\n        } else {\n            nums1[k--] = nums2[j--];\n        }\n    }\n}")
                                                .solutionExplanation(
                                                                "Three-pointer approach from the end. Compare largest elements and place at the back of nums1.")
                                                .tags(Arrays.asList("arrays", "two-pointers", "merging"))
                                                .timeLimit(15)
                                                .points(10)
                                                .createdBy(faculty.getId())
                                                .active(true)
                                                .build(),

                                PracticeQuestion.builder()
                                                .title("Product of Array Except Self")
                                                .description("Return product of all elements except self")
                                                .topic(arrays)
                                                .course(dsa)
                                                .difficulty(PracticeQuestion.DifficultyLevel.MEDIUM)
                                                .type(PracticeQuestion.QuestionType.CODING)
                                                .problemStatement(
                                                                "Given an integer array nums, return an array where answer[i] = product of all elements except nums[i]. Do this without using division.\n\nExample:\nInput: nums = [1,2,3,4]\nOutput: [24,12,8,6]")
                                                .hints(Arrays.asList("Use prefix and suffix products",
                                                                "First pass: prefix products, Second pass: suffix products"))
                                                .solution("public int[] productExceptSelf(int[] nums) {\n    int n = nums.length;\n    int[] result = new int[n];\n    result[0] = 1;\n    for (int i = 1; i < n; i++) {\n        result[i] = result[i-1] * nums[i-1];\n    }\n    int right = 1;\n    for (int i = n - 1; i >= 0; i--) {\n        result[i] *= right;\n        right *= nums[i];\n    }\n    return result;\n}")
                                                .solutionExplanation(
                                                                "Two passes: First pass computes prefix products (left side), second pass multiplies by suffix products (right side).")
                                                .tags(Arrays.asList("arrays", "prefix-sum", "optimization"))
                                                .timeLimit(20)
                                                .points(20)
                                                .createdBy(faculty.getId())
                                                .active(true)
                                                .build(),

                                PracticeQuestion.builder()
                                                .title("Best Time to Buy Stock")
                                                .description("Find maximum profit from buying and selling stock")
                                                .topic(arrays)
                                                .course(dsa)
                                                .difficulty(PracticeQuestion.DifficultyLevel.EASY)
                                                .type(PracticeQuestion.QuestionType.CODING)
                                                .problemStatement(
                                                                "Given an array prices where prices[i] is the price on day i, find the maximum profit you can achieve. You must buy before selling.\n\nExample:\nInput: prices = [7,1,5,3,6,4]\nOutput: 5 (Buy at 1, sell at 6)")
                                                .hints(Arrays.asList("Track minimum price seen so far",
                                                                "At each point, calculate potential profit"))
                                                .solution("public int maxProfit(int[] prices) {\n    int minPrice = Integer.MAX_VALUE;\n    int maxProfit = 0;\n    for (int price : prices) {\n        minPrice = Math.min(minPrice, price);\n        maxProfit = Math.max(maxProfit, price - minPrice);\n    }\n    return maxProfit;\n}")
                                                .solutionExplanation(
                                                                "Single pass: Track minimum price and calculate potential profit at each step.")
                                                .tags(Arrays.asList("arrays", "greedy", "easy"))
                                                .timeLimit(10)
                                                .points(10)
                                                .createdBy(faculty.getId())
                                                .active(true)
                                                .build(),

                                PracticeQuestion.builder()
                                                .title("Container With Most Water")
                                                .description("Find two lines that contain the most water")
                                                .topic(arrays)
                                                .course(dsa)
                                                .difficulty(PracticeQuestion.DifficultyLevel.MEDIUM)
                                                .type(PracticeQuestion.QuestionType.CODING)
                                                .problemStatement(
                                                                "Given n lines at positions with heights height[i], find two lines that form a container that holds the most water.\n\nExample:\nInput: height = [1,8,6,2,5,4,8,3,7]\nOutput: 49")
                                                .hints(Arrays.asList("Two pointer technique",
                                                                "Start from both ends, move the shorter line inward"))
                                                .solution("public int maxArea(int[] height) {\n    int left = 0, right = height.length - 1;\n    int maxArea = 0;\n    while (left < right) {\n        int area = Math.min(height[left], height[right]) * (right - left);\n        maxArea = Math.max(maxArea, area);\n        if (height[left] < height[right]) left++;\n        else right--;\n    }\n    return maxArea;\n}")
                                                .solutionExplanation(
                                                                "Two pointers from ends. Move the shorter line inward since that's the only way to potentially increase area.")
                                                .tags(Arrays.asList("arrays", "two-pointers", "greedy"))
                                                .timeLimit(20)
                                                .points(20)
                                                .createdBy(faculty.getId())
                                                .active(true)
                                                .build(),

                                PracticeQuestion.builder()
                                                .title("Find Missing Number")
                                                .description("Find the missing number in range [0, n]")
                                                .topic(arrays)
                                                .course(dsa)
                                                .difficulty(PracticeQuestion.DifficultyLevel.EASY)
                                                .type(PracticeQuestion.QuestionType.CODING)
                                                .problemStatement(
                                                                "Given an array containing n distinct numbers in range [0, n], find the one missing.\n\nExample:\nInput: nums = [3,0,1]\nOutput: 2")
                                                .hints(Arrays.asList("Use XOR or sum formula",
                                                                "Sum of 0 to n is n*(n+1)/2"))
                                                .solution("public int missingNumber(int[] nums) {\n    int n = nums.length;\n    int expectedSum = n * (n + 1) / 2;\n    int actualSum = 0;\n    for (int num : nums) actualSum += num;\n    return expectedSum - actualSum;\n}")
                                                .solutionExplanation(
                                                                "Calculate expected sum using formula n*(n+1)/2, subtract actual sum to find missing number.")
                                                .tags(Arrays.asList("arrays", "math", "bit-manipulation"))
                                                .timeLimit(10)
                                                .points(10)
                                                .createdBy(faculty.getId())
                                                .active(true)
                                                .build(),

                                PracticeQuestion.builder()
                                                .title("3Sum Problem")
                                                .description("Find all triplets that sum to zero")
                                                .topic(arrays)
                                                .course(dsa)
                                                .difficulty(PracticeQuestion.DifficultyLevel.HARD)
                                                .type(PracticeQuestion.QuestionType.CODING)
                                                .problemStatement(
                                                                "Given an array nums, return all triplets [nums[i], nums[j], nums[k]] such that i != j != k and sum = 0.\n\nExample:\nInput: nums = [-1,0,1,2,-1,-4]\nOutput: [[-1,-1,2],[-1,0,1]]")
                                                .hints(Arrays.asList("Sort the array first",
                                                                "Fix one element, use two pointers for the rest",
                                                                "Skip duplicates"))
                                                .solution("public List<List<Integer>> threeSum(int[] nums) {\n    Arrays.sort(nums);\n    List<List<Integer>> result = new ArrayList<>();\n    for (int i = 0; i < nums.length - 2; i++) {\n        if (i > 0 && nums[i] == nums[i-1]) continue;\n        int left = i + 1, right = nums.length - 1;\n        while (left < right) {\n            int sum = nums[i] + nums[left] + nums[right];\n            if (sum == 0) {\n                result.add(Arrays.asList(nums[i], nums[left], nums[right]));\n                while (left < right && nums[left] == nums[left+1]) left++;\n                while (left < right && nums[right] == nums[right-1]) right--;\n                left++; right--;\n            } else if (sum < 0) left++;\n            else right--;\n        }\n    }\n    return result;\n}")
                                                .solutionExplanation(
                                                                "Sort array, fix first element, use two pointers for remaining two. Skip duplicates to avoid duplicate triplets.")
                                                .tags(Arrays.asList("arrays", "two-pointers", "sorting"))
                                                .timeLimit(30)
                                                .points(30)
                                                .createdBy(faculty.getId())
                                                .active(true)
                                                .build()));

                // ---------- PRACTICE QUESTIONS FOR SQL ----------
                practiceQuestionRepo.saveAll(List.of(
                                PracticeQuestion.builder()
                                                .title("Second Highest Salary")
                                                .description("Find the second highest salary from employees table")
                                                .topic(sql)
                                                .course(dbms)
                                                .difficulty(PracticeQuestion.DifficultyLevel.MEDIUM)
                                                .type(PracticeQuestion.QuestionType.CODING)
                                                .problemStatement(
                                                                "Write a SQL query to find the second highest salary from the Employee table. Return null if there is no second highest.\n\nTable: Employee\n+----+--------+\n| id | salary |\n+----+--------+\n| 1  | 100    |\n| 2  | 200    |\n| 3  | 300    |\n+----+--------+\n\nExpected Output: 200")
                                                .hints(Arrays.asList("Use LIMIT and OFFSET",
                                                                "Consider using subquery or IFNULL"))
                                                .solution("SELECT MAX(salary) AS SecondHighestSalary\nFROM Employee\nWHERE salary < (SELECT MAX(salary) FROM Employee);")
                                                .solutionExplanation(
                                                                "Find the maximum salary that is less than the overall maximum salary.")
                                                .tags(Arrays.asList("sql", "subquery", "aggregate"))
                                                .timeLimit(15)
                                                .points(15)
                                                .createdBy(faculty.getId())
                                                .active(true)
                                                .build(),

                                PracticeQuestion.builder()
                                                .title("Duplicate Emails")
                                                .description("Find all duplicate emails in a table")
                                                .topic(sql)
                                                .course(dbms)
                                                .difficulty(PracticeQuestion.DifficultyLevel.EASY)
                                                .type(PracticeQuestion.QuestionType.CODING)
                                                .problemStatement(
                                                                "Write a SQL query to find all duplicate emails in the Person table.\n\nTable: Person\n+----+-------------+\n| id | email       |\n+----+-------------+\n| 1  | a@b.com     |\n| 2  | c@d.com     |\n| 3  | a@b.com     |\n+----+-------------+\n\nExpected Output: a@b.com")
                                                .hints(Arrays.asList("Use GROUP BY and HAVING",
                                                                "Count occurrences of each email"))
                                                .solution("SELECT email\nFROM Person\nGROUP BY email\nHAVING COUNT(*) > 1;")
                                                .solutionExplanation(
                                                                "Group by email and filter groups with count > 1 using HAVING clause.")
                                                .tags(Arrays.asList("sql", "group-by", "having"))
                                                .timeLimit(10)
                                                .points(10)
                                                .createdBy(faculty.getId())
                                                .active(true)
                                                .build(),

                                PracticeQuestion.builder()
                                                .title("Customers Who Never Order")
                                                .description("Find customers who never placed an order")
                                                .topic(sql)
                                                .course(dbms)
                                                .difficulty(PracticeQuestion.DifficultyLevel.EASY)
                                                .type(PracticeQuestion.QuestionType.CODING)
                                                .problemStatement(
                                                                "Find all customers who never ordered anything.\n\nTable: Customers\n+----+-------+\n| id | name  |\n+----+-------+\n| 1  | Joe   |\n| 2  | Henry |\n+----+-------+\n\nTable: Orders\n+----+------------+\n| id | customerId |\n+----+------------+\n| 1  | 1          |\n+----+------------+")
                                                .hints(Arrays.asList("Use LEFT JOIN or NOT IN",
                                                                "Find customers not in Orders table"))
                                                .solution("SELECT c.name AS Customers\nFROM Customers c\nLEFT JOIN Orders o ON c.id = o.customerId\nWHERE o.id IS NULL;")
                                                .solutionExplanation(
                                                                "Use LEFT JOIN to include all customers, then filter where order.id is NULL (no matching order).")
                                                .tags(Arrays.asList("sql", "left-join", "null-check"))
                                                .timeLimit(15)
                                                .points(10)
                                                .createdBy(faculty.getId())
                                                .active(true)
                                                .build(),

                                PracticeQuestion.builder()
                                                .title("Department Highest Salary")
                                                .description("Find highest salary in each department")
                                                .topic(sql)
                                                .course(dbms)
                                                .difficulty(PracticeQuestion.DifficultyLevel.MEDIUM)
                                                .type(PracticeQuestion.QuestionType.CODING)
                                                .problemStatement(
                                                                "Find employees with the highest salary in each department.\n\nTable: Employee\n+----+-------+--------+--------------+\n| id | name  | salary | departmentId |\n+----+-------+--------+--------------+\n| 1  | Joe   | 85000  | 1            |\n| 2  | Henry | 80000  | 2            |\n| 3  | Max   | 90000  | 1            |\n+----+-------+--------+--------------+\n\nTable: Department\n+----+----------+\n| id | name     |\n+----+----------+\n| 1  | IT       |\n| 2  | Sales    |\n+----+----------+")
                                                .hints(Arrays.asList("Use a subquery to find max salary per department",
                                                                "Join with employee to get names"))
                                                .solution("SELECT d.name AS Department, e.name AS Employee, e.salary AS Salary\nFROM Employee e\nJOIN Department d ON e.departmentId = d.id\nWHERE (e.departmentId, e.salary) IN (\n    SELECT departmentId, MAX(salary)\n    FROM Employee\n    GROUP BY departmentId\n);")
                                                .solutionExplanation(
                                                                "Find max salary per department using subquery, then join to get employee details.")
                                                .tags(Arrays.asList("sql", "join", "subquery", "aggregate"))
                                                .timeLimit(20)
                                                .points(20)
                                                .createdBy(faculty.getId())
                                                .active(true)
                                                .build(),

                                PracticeQuestion.builder()
                                                .title("Rising Temperature")
                                                .description("Find dates with higher temperature than previous day")
                                                .topic(sql)
                                                .course(dbms)
                                                .difficulty(PracticeQuestion.DifficultyLevel.EASY)
                                                .type(PracticeQuestion.QuestionType.CODING)
                                                .problemStatement(
                                                                "Find all dates' Id with higher temperatures compared to previous dates.\n\nTable: Weather\n+----+------------+-------------+\n| id | recordDate | temperature |\n+----+------------+-------------+\n| 1  | 2015-01-01 | 10          |\n| 2  | 2015-01-02 | 25          |\n| 3  | 2015-01-03 | 20          |\n+----+------------+-------------+\n\nExpected Output: id = 2")
                                                .hints(Arrays.asList("Self-join on consecutive dates",
                                                                "Use DATEDIFF or DATE_SUB"))
                                                .solution("SELECT w1.id\nFROM Weather w1\nJOIN Weather w2 ON DATEDIFF(w1.recordDate, w2.recordDate) = 1\nWHERE w1.temperature > w2.temperature;")
                                                .solutionExplanation(
                                                                "Self-join where dates differ by exactly 1 day, filter where today's temp > yesterday's temp.")
                                                .tags(Arrays.asList("sql", "self-join", "date-functions"))
                                                .timeLimit(15)
                                                .points(15)
                                                .createdBy(faculty.getId())
                                                .active(true)
                                                .build(),

                                PracticeQuestion.builder()
                                                .title("Rank Scores")
                                                .description("Rank scores with dense ranking")
                                                .topic(sql)
                                                .course(dbms)
                                                .difficulty(PracticeQuestion.DifficultyLevel.MEDIUM)
                                                .type(PracticeQuestion.QuestionType.CODING)
                                                .problemStatement(
                                                                "Write a SQL query to rank scores. If two scores are equal, they should have the same rank.\n\nTable: Scores\n+----+-------+\n| id | score |\n+----+-------+\n| 1  | 3.50  |\n| 2  | 3.65  |\n| 3  | 4.00  |\n| 4  | 3.85  |\n+----+-------+\n\nExpected: Score 4.00 = Rank 1, 3.85 = Rank 2, etc.")
                                                .hints(Arrays.asList("Use DENSE_RANK() window function",
                                                                "Or use subquery to count distinct higher scores"))
                                                .solution("SELECT score,\n       DENSE_RANK() OVER (ORDER BY score DESC) AS 'rank'\nFROM Scores;")
                                                .solutionExplanation(
                                                                "DENSE_RANK() assigns ranks without gaps. Scores with same value get same rank.")
                                                .tags(Arrays.asList("sql", "window-function", "ranking"))
                                                .timeLimit(15)
                                                .points(15)
                                                .createdBy(faculty.getId())
                                                .active(true)
                                                .build(),

                                PracticeQuestion.builder()
                                                .title("Delete Duplicate Emails")
                                                .description("Delete duplicate emails keeping lowest id")
                                                .topic(sql)
                                                .course(dbms)
                                                .difficulty(PracticeQuestion.DifficultyLevel.EASY)
                                                .type(PracticeQuestion.QuestionType.CODING)
                                                .problemStatement(
                                                                "Delete all duplicate emails, keeping only the one with the smallest id.\n\nTable: Person\n+----+-------------+\n| id | email       |\n+----+-------------+\n| 1  | a@b.com     |\n| 2  | c@d.com     |\n| 3  | a@b.com     |\n+----+-------------+\n\nAfter: Keep id 1 and 2, delete id 3")
                                                .hints(Arrays.asList("Use self-join or subquery",
                                                                "Compare rows with same email"))
                                                .solution("DELETE p1\nFROM Person p1, Person p2\nWHERE p1.email = p2.email AND p1.id > p2.id;")
                                                .solutionExplanation(
                                                                "Self-join on same email, delete rows where id is greater (keeping smallest id).")
                                                .tags(Arrays.asList("sql", "delete", "self-join"))
                                                .timeLimit(15)
                                                .points(15)
                                                .createdBy(faculty.getId())
                                                .active(true)
                                                .build(),

                                PracticeQuestion.builder()
                                                .title("Consecutive Numbers")
                                                .description("Find numbers appearing 3+ times consecutively")
                                                .topic(sql)
                                                .course(dbms)
                                                .difficulty(PracticeQuestion.DifficultyLevel.MEDIUM)
                                                .type(PracticeQuestion.QuestionType.CODING)
                                                .problemStatement(
                                                                "Find all numbers that appear at least three times consecutively.\n\nTable: Logs\n+----+-----+\n| id | num |\n+----+-----+\n| 1  | 1   |\n| 2  | 1   |\n| 3  | 1   |\n| 4  | 2   |\n| 5  | 1   |\n+----+-----+\n\nExpected Output: 1")
                                                .hints(Arrays.asList("Join table with itself 3 times",
                                                                "Use LAG/LEAD window functions"))
                                                .solution("SELECT DISTINCT l1.num AS ConsecutiveNums\nFROM Logs l1, Logs l2, Logs l3\nWHERE l1.id = l2.id - 1\n  AND l2.id = l3.id - 1\n  AND l1.num = l2.num\n  AND l2.num = l3.num;")
                                                .solutionExplanation(
                                                                "Triple self-join where IDs are consecutive and all three rows have the same number.")
                                                .tags(Arrays.asList("sql", "self-join", "consecutive"))
                                                .timeLimit(20)
                                                .points(20)
                                                .createdBy(faculty.getId())
                                                .active(true)
                                                .build(),

                                PracticeQuestion.builder()
                                                .title("Employees Earning More Than Managers")
                                                .description("Find employees earning more than their managers")
                                                .topic(sql)
                                                .course(dbms)
                                                .difficulty(PracticeQuestion.DifficultyLevel.EASY)
                                                .type(PracticeQuestion.QuestionType.CODING)
                                                .problemStatement(
                                                                "Find employees who earn more than their managers.\n\nTable: Employee\n+----+-------+--------+-----------+\n| id | name  | salary | managerId |\n+----+-------+--------+-----------+\n| 1  | Joe   | 70000  | 3         |\n| 2  | Henry | 80000  | 4         |\n| 3  | Sam   | 60000  | NULL      |\n| 4  | Max   | 90000  | NULL      |\n+----+-------+--------+-----------+")
                                                .hints(Arrays.asList("Self-join employee with manager",
                                                                "Compare salaries"))
                                                .solution("SELECT e.name AS Employee\nFROM Employee e\nJOIN Employee m ON e.managerId = m.id\nWHERE e.salary > m.salary;")
                                                .solutionExplanation(
                                                                "Self-join to get manager details, then compare employee salary with manager salary.")
                                                .tags(Arrays.asList("sql", "self-join", "comparison"))
                                                .timeLimit(10)
                                                .points(10)
                                                .createdBy(faculty.getId())
                                                .active(true)
                                                .build(),

                                PracticeQuestion.builder()
                                                .title("Nth Highest Salary")
                                                .description("Find the Nth highest salary")
                                                .topic(sql)
                                                .course(dbms)
                                                .difficulty(PracticeQuestion.DifficultyLevel.HARD)
                                                .type(PracticeQuestion.QuestionType.CODING)
                                                .problemStatement(
                                                                "Write a SQL function to get the nth highest salary from Employee table.\n\nCREATE FUNCTION getNthHighestSalary(N INT) RETURNS INT\n\nTable: Employee\n+----+--------+\n| id | salary |\n+----+--------+\n| 1  | 100    |\n| 2  | 200    |\n| 3  | 300    |\n+----+--------+")
                                                .hints(Arrays.asList("Use LIMIT with OFFSET",
                                                                "Handle edge cases with DISTINCT"))
                                                .solution("CREATE FUNCTION getNthHighestSalary(N INT) RETURNS INT\nBEGIN\n  SET N = N - 1;\n  RETURN (\n    SELECT DISTINCT salary\n    FROM Employee\n    ORDER BY salary DESC\n    LIMIT 1 OFFSET N\n  );\nEND")
                                                .solutionExplanation(
                                                                "Use LIMIT 1 OFFSET N-1 to skip N-1 rows and get Nth row. DISTINCT handles duplicates.")
                                                .tags(Arrays.asList("sql", "function", "limit-offset"))
                                                .timeLimit(25)
                                                .points(25)
                                                .createdBy(faculty.getId())
                                                .active(true)
                                                .build()));

                // ---------- MCQ QUESTIONS FOR ARRAYS ----------
                practiceQuestionRepo.saveAll(List.of(
                                PracticeQuestion.builder()
                                                .title("Array Time Complexity")
                                                .description("Understanding array access time complexity")
                                                .topic(arrays)
                                                .course(dsa)
                                                .difficulty(PracticeQuestion.DifficultyLevel.EASY)
                                                .type(PracticeQuestion.QuestionType.MCQ)
                                                .problemStatement(
                                                                "What is the time complexity of accessing an element in an array by index?\n\nA) O(n)\nB) O(1)\nC) O(log n)\nD) O(n²)")
                                                .solution("B")
                                                .solutionExplanation(
                                                                "Array access by index is O(1) because arrays use contiguous memory locations and direct address calculation.")
                                                .tags(Arrays.asList("arrays", "time-complexity", "basics"))
                                                .timeLimit(2)
                                                .points(5)
                                                .createdBy(faculty.getId())
                                                .active(true)
                                                .build(),

                                PracticeQuestion.builder()
                                                .title("Array Insertion Complexity")
                                                .description("Time complexity of inserting at beginning")
                                                .topic(arrays)
                                                .course(dsa)
                                                .difficulty(PracticeQuestion.DifficultyLevel.EASY)
                                                .type(PracticeQuestion.QuestionType.MCQ)
                                                .problemStatement(
                                                                "What is the time complexity of inserting an element at the beginning of an array?\n\nA) O(1)\nB) O(log n)\nC) O(n)\nD) O(n log n)")
                                                .solution("C")
                                                .solutionExplanation(
                                                                "Inserting at the beginning requires shifting all existing elements one position to the right, which takes O(n) time.")
                                                .tags(Arrays.asList("arrays", "time-complexity", "insertion"))
                                                .timeLimit(2)
                                                .points(5)
                                                .createdBy(faculty.getId())
                                                .active(true)
                                                .build(),

                                PracticeQuestion.builder()
                                                .title("Array vs Linked List")
                                                .description("Comparing array and linked list properties")
                                                .topic(arrays)
                                                .course(dsa)
                                                .difficulty(PracticeQuestion.DifficultyLevel.EASY)
                                                .type(PracticeQuestion.QuestionType.MCQ)
                                                .problemStatement(
                                                                "Which statement about arrays is TRUE?\n\nA) Arrays can grow dynamically without reallocation\nB) Arrays store elements in non-contiguous memory\nC) Arrays provide O(1) random access\nD) Arrays are better than linked lists for frequent insertions")
                                                .solution("C")
                                                .solutionExplanation(
                                                                "Arrays provide O(1) random access because elements are stored contiguously and can be accessed directly using index arithmetic.")
                                                .tags(Arrays.asList("arrays", "linked-list", "comparison"))
                                                .timeLimit(2)
                                                .points(5)
                                                .createdBy(faculty.getId())
                                                .active(true)
                                                .build(),

                                PracticeQuestion.builder()
                                                .title("2D Array Memory Layout")
                                                .description("Understanding row-major order")
                                                .topic(arrays)
                                                .course(dsa)
                                                .difficulty(PracticeQuestion.DifficultyLevel.MEDIUM)
                                                .type(PracticeQuestion.QuestionType.MCQ)
                                                .problemStatement(
                                                                "In a 2D array arr[3][4] stored in row-major order, what is the position of arr[1][2] if base address is 1000 and each element is 4 bytes?\n\nA) 1024\nB) 1028\nC) 1020\nD) 1032")
                                                .solution("A")
                                                .solutionExplanation(
                                                                "Position = Base + ((row * num_cols) + col) * size = 1000 + ((1 * 4) + 2) * 4 = 1000 + 24 = 1024")
                                                .tags(Arrays.asList("arrays", "2d-arrays", "memory"))
                                                .timeLimit(3)
                                                .points(10)
                                                .createdBy(faculty.getId())
                                                .active(true)
                                                .build(),

                                PracticeQuestion.builder()
                                                .title("Binary Search Prerequisite")
                                                .description("Understanding binary search requirements")
                                                .topic(arrays)
                                                .course(dsa)
                                                .difficulty(PracticeQuestion.DifficultyLevel.EASY)
                                                .type(PracticeQuestion.QuestionType.MCQ)
                                                .problemStatement(
                                                                "What is a prerequisite for performing binary search on an array?\n\nA) Array must have unique elements\nB) Array must be sorted\nC) Array must have even number of elements\nD) Array must contain only positive numbers")
                                                .solution("B")
                                                .solutionExplanation(
                                                                "Binary search requires a sorted array to work correctly. It compares the middle element and eliminates half of the remaining elements.")
                                                .tags(Arrays.asList("arrays", "binary-search", "searching"))
                                                .timeLimit(2)
                                                .points(5)
                                                .createdBy(faculty.getId())
                                                .active(true)
                                                .build(),

                                PracticeQuestion.builder()
                                                .title("Array Rotation Output")
                                                .description("Finding result of array rotation")
                                                .topic(arrays)
                                                .course(dsa)
                                                .difficulty(PracticeQuestion.DifficultyLevel.MEDIUM)
                                                .type(PracticeQuestion.QuestionType.MCQ)
                                                .problemStatement(
                                                                "What is the result of rotating array [1, 2, 3, 4, 5] right by 2 positions?\n\nA) [3, 4, 5, 1, 2]\nB) [4, 5, 1, 2, 3]\nC) [2, 3, 4, 5, 1]\nD) [5, 1, 2, 3, 4]")
                                                .solution("B")
                                                .solutionExplanation(
                                                                "Right rotation by 2: last 2 elements [4,5] move to front, rest shift right. Result: [4, 5, 1, 2, 3]")
                                                .tags(Arrays.asList("arrays", "rotation", "manipulation"))
                                                .timeLimit(3)
                                                .points(10)
                                                .createdBy(faculty.getId())
                                                .active(true)
                                                .build(),

                                PracticeQuestion.builder()
                                                .title("Subarray Sum Technique")
                                                .description("Best technique for subarray sum problems")
                                                .topic(arrays)
                                                .course(dsa)
                                                .difficulty(PracticeQuestion.DifficultyLevel.MEDIUM)
                                                .type(PracticeQuestion.QuestionType.MCQ)
                                                .problemStatement(
                                                                "Which technique is most efficient for finding if a subarray with sum K exists?\n\nA) Brute force O(n³)\nB) Sorting O(n log n)\nC) Prefix sum with HashMap O(n)\nD) Binary search O(log n)")
                                                .solution("C")
                                                .solutionExplanation(
                                                                "Prefix sum with HashMap achieves O(n) by storing cumulative sums and checking if (currentSum - K) exists in the map.")
                                                .tags(Arrays.asList("arrays", "prefix-sum", "hashmap"))
                                                .timeLimit(3)
                                                .points(10)
                                                .createdBy(faculty.getId())
                                                .active(true)
                                                .build(),

                                PracticeQuestion.builder()
                                                .title("Kadane's Algorithm")
                                                .description("Maximum subarray sum algorithm")
                                                .topic(arrays)
                                                .course(dsa)
                                                .difficulty(PracticeQuestion.DifficultyLevel.MEDIUM)
                                                .type(PracticeQuestion.QuestionType.MCQ)
                                                .problemStatement(
                                                                "What is the maximum subarray sum of [-2, 1, -3, 4, -1, 2, 1, -5, 4]?\n\nA) 4\nB) 5\nC) 6\nD) 7")
                                                .solution("C")
                                                .solutionExplanation(
                                                                "Using Kadane's algorithm, the maximum subarray is [4, -1, 2, 1] with sum = 6.")
                                                .tags(Arrays.asList("arrays", "kadanes", "dp"))
                                                .timeLimit(3)
                                                .points(10)
                                                .createdBy(faculty.getId())
                                                .active(true)
                                                .build(),

                                PracticeQuestion.builder()
                                                .title("Dutch National Flag")
                                                .description("Sorting 0s, 1s, and 2s")
                                                .topic(arrays)
                                                .course(dsa)
                                                .difficulty(PracticeQuestion.DifficultyLevel.MEDIUM)
                                                .type(PracticeQuestion.QuestionType.MCQ)
                                                .problemStatement(
                                                                "What is the time complexity of sorting an array containing only 0s, 1s, and 2s using Dutch National Flag algorithm?\n\nA) O(n log n)\nB) O(n²)\nC) O(n)\nD) O(1)")
                                                .solution("C")
                                                .solutionExplanation(
                                                                "Dutch National Flag uses three pointers and makes a single pass through the array, achieving O(n) time complexity.")
                                                .tags(Arrays.asList("arrays", "sorting", "three-pointers"))
                                                .timeLimit(2)
                                                .points(10)
                                                .createdBy(faculty.getId())
                                                .active(true)
                                                .build(),

                                PracticeQuestion.builder()
                                                .title("Sliding Window Maximum")
                                                .description("Optimal data structure for sliding window")
                                                .topic(arrays)
                                                .course(dsa)
                                                .difficulty(PracticeQuestion.DifficultyLevel.HARD)
                                                .type(PracticeQuestion.QuestionType.MCQ)
                                                .problemStatement(
                                                                "Which data structure is optimal for finding maximum in each sliding window of size k?\n\nA) Stack\nB) Queue\nC) Deque (Double-ended queue)\nD) Priority Queue")
                                                .solution("C")
                                                .solutionExplanation(
                                                                "Deque maintains elements in decreasing order, allowing O(1) access to maximum while supporting efficient removal from both ends.")
                                                .tags(Arrays.asList("arrays", "sliding-window", "deque"))
                                                .timeLimit(3)
                                                .points(15)
                                                .createdBy(faculty.getId())
                                                .active(true)
                                                .build()));

                // ---------- MCQ QUESTIONS FOR SQL ----------
                practiceQuestionRepo.saveAll(List.of(
                                PracticeQuestion.builder()
                                                .title("SQL SELECT Basics")
                                                .description("Understanding SELECT statement")
                                                .topic(sql)
                                                .course(dbms)
                                                .difficulty(PracticeQuestion.DifficultyLevel.EASY)
                                                .type(PracticeQuestion.QuestionType.MCQ)
                                                .problemStatement(
                                                                "Which SQL clause is used to filter rows based on a condition?\n\nA) ORDER BY\nB) GROUP BY\nC) WHERE\nD) HAVING")
                                                .solution("C")
                                                .solutionExplanation(
                                                                "WHERE clause filters rows before grouping. HAVING filters after GROUP BY, ORDER BY sorts results, GROUP BY groups rows.")
                                                .tags(Arrays.asList("sql", "select", "where"))
                                                .timeLimit(2)
                                                .points(5)
                                                .createdBy(faculty.getId())
                                                .active(true)
                                                .build(),

                                PracticeQuestion.builder()
                                                .title("JOIN Types")
                                                .description("Understanding different JOIN types")
                                                .topic(sql)
                                                .course(dbms)
                                                .difficulty(PracticeQuestion.DifficultyLevel.EASY)
                                                .type(PracticeQuestion.QuestionType.MCQ)
                                                .problemStatement(
                                                                "Which JOIN returns all rows from the left table and matched rows from the right table?\n\nA) INNER JOIN\nB) LEFT JOIN\nC) RIGHT JOIN\nD) CROSS JOIN")
                                                .solution("B")
                                                .solutionExplanation(
                                                                "LEFT JOIN (or LEFT OUTER JOIN) returns all rows from the left table, with NULL for unmatched right table columns.")
                                                .tags(Arrays.asList("sql", "join", "left-join"))
                                                .timeLimit(2)
                                                .points(5)
                                                .createdBy(faculty.getId())
                                                .active(true)
                                                .build(),

                                PracticeQuestion.builder()
                                                .title("Aggregate Functions")
                                                .description("Using COUNT with NULL values")
                                                .topic(sql)
                                                .course(dbms)
                                                .difficulty(PracticeQuestion.DifficultyLevel.EASY)
                                                .type(PracticeQuestion.QuestionType.MCQ)
                                                .problemStatement(
                                                                "Given a table with 10 rows where column 'age' has 3 NULL values, what does COUNT(age) return?\n\nA) 10\nB) 7\nC) 3\nD) NULL")
                                                .solution("B")
                                                .solutionExplanation(
                                                                "COUNT(column) counts non-NULL values only. COUNT(*) counts all rows including NULLs. So COUNT(age) = 10 - 3 = 7.")
                                                .tags(Arrays.asList("sql", "aggregate", "count"))
                                                .timeLimit(2)
                                                .points(5)
                                                .createdBy(faculty.getId())
                                                .active(true)
                                                .build(),

                                PracticeQuestion.builder()
                                                .title("GROUP BY vs HAVING")
                                                .description("Difference between WHERE and HAVING")
                                                .topic(sql)
                                                .course(dbms)
                                                .difficulty(PracticeQuestion.DifficultyLevel.MEDIUM)
                                                .type(PracticeQuestion.QuestionType.MCQ)
                                                .problemStatement(
                                                                "Which statement is TRUE about HAVING clause?\n\nA) HAVING can be used without GROUP BY\nB) HAVING filters rows before grouping\nC) HAVING can use aggregate functions\nD) HAVING and WHERE are interchangeable")
                                                .solution("C")
                                                .solutionExplanation(
                                                                "HAVING filters groups after GROUP BY and can use aggregate functions like SUM, COUNT. WHERE cannot use aggregates and filters before grouping.")
                                                .tags(Arrays.asList("sql", "group-by", "having"))
                                                .timeLimit(2)
                                                .points(10)
                                                .createdBy(faculty.getId())
                                                .active(true)
                                                .build(),

                                PracticeQuestion.builder()
                                                .title("SQL Subquery Types")
                                                .description("Understanding correlated subqueries")
                                                .topic(sql)
                                                .course(dbms)
                                                .difficulty(PracticeQuestion.DifficultyLevel.MEDIUM)
                                                .type(PracticeQuestion.QuestionType.MCQ)
                                                .problemStatement(
                                                                "What makes a subquery 'correlated'?\n\nA) It uses JOIN keyword\nB) It references columns from the outer query\nC) It returns multiple rows\nD) It uses aggregate functions")
                                                .solution("B")
                                                .solutionExplanation(
                                                                "A correlated subquery references columns from the outer query and is executed once for each row processed by the outer query.")
                                                .tags(Arrays.asList("sql", "subquery", "correlated"))
                                                .timeLimit(3)
                                                .points(10)
                                                .createdBy(faculty.getId())
                                                .active(true)
                                                .build(),

                                PracticeQuestion.builder()
                                                .title("Primary Key Constraint")
                                                .description("Properties of primary key")
                                                .topic(sql)
                                                .course(dbms)
                                                .difficulty(PracticeQuestion.DifficultyLevel.EASY)
                                                .type(PracticeQuestion.QuestionType.MCQ)
                                                .problemStatement(
                                                                "Which is NOT a property of a PRIMARY KEY?\n\nA) Must be unique\nB) Cannot be NULL\nC) Can have multiple primary keys per table\nD) Automatically creates an index")
                                                .solution("C")
                                                .solutionExplanation(
                                                                "A table can have only ONE primary key (though it can be composite). Primary keys are unique, non-null, and usually indexed.")
                                                .tags(Arrays.asList("sql", "primary-key", "constraints"))
                                                .timeLimit(2)
                                                .points(5)
                                                .createdBy(faculty.getId())
                                                .active(true)
                                                .build(),

                                PracticeQuestion.builder()
                                                .title("UNION vs UNION ALL")
                                                .description("Difference between UNION operators")
                                                .topic(sql)
                                                .course(dbms)
                                                .difficulty(PracticeQuestion.DifficultyLevel.MEDIUM)
                                                .type(PracticeQuestion.QuestionType.MCQ)
                                                .problemStatement(
                                                                "What is the main difference between UNION and UNION ALL?\n\nA) UNION ALL is faster and removes duplicates\nB) UNION removes duplicates, UNION ALL keeps all rows\nC) UNION ALL works only with same column names\nD) UNION requires same number of columns, UNION ALL doesn't")
                                                .solution("B")
                                                .solutionExplanation(
                                                                "UNION removes duplicate rows (slower due to distinct operation). UNION ALL keeps all rows including duplicates (faster).")
                                                .tags(Arrays.asList("sql", "union", "set-operations"))
                                                .timeLimit(2)
                                                .points(10)
                                                .createdBy(faculty.getId())
                                                .active(true)
                                                .build(),

                                PracticeQuestion.builder()
                                                .title("Index Performance")
                                                .description("When indexes help queries")
                                                .topic(sql)
                                                .course(dbms)
                                                .difficulty(PracticeQuestion.DifficultyLevel.MEDIUM)
                                                .type(PracticeQuestion.QuestionType.MCQ)
                                                .problemStatement(
                                                                "In which scenario would an index on column 'status' be LEAST effective?\n\nA) SELECT * FROM orders WHERE status = 'PENDING'\nB) SELECT * FROM orders WHERE status IN ('A','B','C')\nC) SELECT * FROM orders WHERE status LIKE 'PEND%'\nD) SELECT * FROM orders WHERE status IS NOT NULL (95% non-null)")
                                                .solution("D")
                                                .solutionExplanation(
                                                                "When most rows match (95% non-null), full table scan is often faster than index lookup. Indexes work best for selective queries.")
                                                .tags(Arrays.asList("sql", "index", "performance"))
                                                .timeLimit(3)
                                                .points(10)
                                                .createdBy(faculty.getId())
                                                .active(true)
                                                .build(),

                                PracticeQuestion.builder()
                                                .title("Normalization Forms")
                                                .description("Understanding database normalization")
                                                .topic(sql)
                                                .course(dbms)
                                                .difficulty(PracticeQuestion.DifficultyLevel.MEDIUM)
                                                .type(PracticeQuestion.QuestionType.MCQ)
                                                .problemStatement(
                                                                "A table is in 3NF if it is in 2NF and:\n\nA) Has no repeating groups\nB) All non-key attributes depend on the whole primary key\nC) No transitive dependencies exist\nD) All attributes are atomic")
                                                .solution("C")
                                                .solutionExplanation(
                                                                "3NF requires no transitive dependencies: non-key attributes must depend only on the primary key, not on other non-key attributes.")
                                                .tags(Arrays.asList("sql", "normalization", "3nf"))
                                                .timeLimit(3)
                                                .points(10)
                                                .createdBy(faculty.getId())
                                                .active(true)
                                                .build(),

                                PracticeQuestion.builder()
                                                .title("Transaction ACID Properties")
                                                .description("Understanding database transactions")
                                                .topic(sql)
                                                .course(dbms)
                                                .difficulty(PracticeQuestion.DifficultyLevel.HARD)
                                                .type(PracticeQuestion.QuestionType.MCQ)
                                                .problemStatement(
                                                                "Which ACID property ensures that once a transaction is committed, it will survive system failures?\n\nA) Atomicity\nB) Consistency\nC) Isolation\nD) Durability")
                                                .solution("D")
                                                .solutionExplanation(
                                                                "Durability ensures committed transactions persist even after system crashes. Atomicity = all-or-nothing, Consistency = valid states, Isolation = concurrent independence.")
                                                .tags(Arrays.asList("sql", "acid", "transactions"))
                                                .timeLimit(3)
                                                .points(15)
                                                .createdBy(faculty.getId())
                                                .active(true)
                                                .build()));

                System.out.println("✅ Practice questions seeded successfully");
        }
}
