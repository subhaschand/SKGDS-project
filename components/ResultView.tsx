
import React, { useState, useEffect, useRef } from 'react';
import { AssessmentResult, RecommendationType } from '../types';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, Cell } from 'recharts';
import { GoogleGenAI } from "@google/genai";

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';
const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY || '';
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

interface AIRecommendation {
  topicName: string;
  keyConceptsToLearn: string[];
  resources: {
    title: string;
    url: string;
    type: 'VIDEO' | 'ARTICLE' | 'TUTORIAL';
    description: string;
  }[];
  practiceExercises: string[];
  estimatedTime: string;
}

interface Props {
  result: AssessmentResult;
  onReset: () => void;
}

// Comprehensive curated recommendations for CS topics
const FALLBACK_RECOMMENDATIONS: Record<string, AIRecommendation> = {
  'default': {
    topicName: 'General Programming',
    keyConceptsToLearn: ['Problem Solving', 'Algorithm Design', 'Code Optimization', 'Debugging', 'Clean Code Principles'],
    resources: [
      { title: 'CS50 Introduction to Computer Science', url: 'https://www.youtube.com/watch?v=zOjov-2OZ0E', type: 'VIDEO', description: 'Harvard CS50 - Best intro to programming' },
      { title: 'freeCodeCamp Interactive Tutorials', url: 'https://www.freecodecamp.org/learn', type: 'TUTORIAL', description: 'Free interactive coding tutorials' },
      { title: 'Algorithm Fundamentals', url: 'https://www.geeksforgeeks.org/fundamentals-of-algorithms/', type: 'ARTICLE', description: 'Complete algorithm basics guide' },
      { title: 'Coding Problems Practice', url: 'https://leetcode.com/problemset/all/', type: 'TUTORIAL', description: 'Practice problems of varying difficulty' },
    ],
    practiceExercises: ['Solve 5 easy problems on LeetCode', 'Build a simple calculator', 'Write a program to find prime numbers', 'Implement FizzBuzz algorithm'],
    estimatedTime: '3-4 hours'
  },
  'arrays': {
    topicName: 'Arrays',
    keyConceptsToLearn: ['Array Declaration', 'Indexing', 'Traversal', 'Multi-dimensional Arrays', 'Array Operations', 'Dynamic Arrays'],
    resources: [
      { title: 'Arrays - Complete Tutorial', url: 'https://www.youtube.com/watch?v=QJvmkR1JKo0', type: 'VIDEO', description: 'Complete guide to arrays' },
      { title: 'Array Data Structure', url: 'https://www.geeksforgeeks.org/array-data-structure/', type: 'ARTICLE', description: 'GeeksForGeeks array guide' },
      { title: 'MDN JavaScript Arrays', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array', type: 'ARTICLE', description: 'Complete MDN reference' },
      { title: 'LeetCode Array Problems', url: 'https://leetcode.com/tag/array/', type: 'TUTORIAL', description: 'Practice array problems' },
    ],
    practiceExercises: ['Implement array rotation', 'Find the maximum element', 'Merge two sorted arrays', 'Remove duplicates', 'Two Sum problem'],
    estimatedTime: '2-3 hours'
  },
  'sql': {
    topicName: 'SQL & Database Queries',
    keyConceptsToLearn: ['SELECT queries', 'WHERE clauses', 'JOINs (INNER, LEFT, RIGHT)', 'GROUP BY', 'ORDER BY', 'Aggregate Functions', 'Subqueries'],
    resources: [
      { title: 'SQL Full Course - freeCodeCamp', url: 'https://www.youtube.com/watch?v=HXV3zeQKqGY', type: 'VIDEO', description: '4-hour complete SQL course' },
      { title: 'W3Schools SQL Tutorial', url: 'https://www.w3schools.com/sql/', type: 'TUTORIAL', description: 'Interactive SQL tutorial' },
      { title: 'SQLZoo Practice', url: 'https://sqlzoo.net/', type: 'TUTORIAL', description: 'Interactive SQL exercises' },
      { title: 'SQL Joins Guide', url: 'https://www.geeksforgeeks.org/sql-join-set-1-inner-left-right-and-full-joins/', type: 'ARTICLE', description: 'Understanding JOINs visually' },
    ],
    practiceExercises: ['Write SELECT with WHERE and ORDER BY', 'Join two tables to get related data', 'Use GROUP BY with aggregate functions', 'Write subqueries', 'Create and populate tables'],
    estimatedTime: '3-4 hours'
  },
  'sorting': {
    topicName: 'Sorting Algorithms',
    keyConceptsToLearn: ['Bubble Sort', 'Selection Sort', 'Insertion Sort', 'Merge Sort', 'Quick Sort', 'Time Complexity Analysis', 'Space Complexity'],
    resources: [
      { title: 'Sorting Algorithms Visualized', url: 'https://www.youtube.com/watch?v=kPRA0W1kECg', type: 'VIDEO', description: 'Visual explanation of all sorting algorithms' },
      { title: 'VisuAlgo - Sorting', url: 'https://visualgo.net/en/sorting', type: 'TUTORIAL', description: 'Interactive sorting visualizations' },
      { title: 'Sorting Algorithms Guide', url: 'https://www.geeksforgeeks.org/sorting-algorithms/', type: 'ARTICLE', description: 'Complete sorting reference' },
      { title: 'Sorting - Abdul Bari', url: 'https://www.youtube.com/watch?v=pkkFqlG0Hds', type: 'VIDEO', description: 'Detailed sorting explanations' },
    ],
    practiceExercises: ['Implement Bubble Sort from scratch', 'Implement Merge Sort', 'Implement Quick Sort', 'Compare algorithm performance', 'Sort objects by property'],
    estimatedTime: '4-5 hours'
  },
  'trees': {
    topicName: 'Trees & Binary Trees',
    keyConceptsToLearn: ['Tree Terminology', 'Binary Tree Properties', 'Inorder/Preorder/Postorder Traversals', 'BST Operations', 'Balanced Trees', 'Recursion with Trees'],
    resources: [
      { title: 'Binary Trees Tutorial', url: 'https://www.youtube.com/watch?v=fAAZixBzIAI', type: 'VIDEO', description: 'Complete binary tree guide' },
      { title: 'Binary Tree Data Structure', url: 'https://www.geeksforgeeks.org/binary-tree-data-structure/', type: 'ARTICLE', description: 'GeeksForGeeks comprehensive guide' },
      { title: 'VisuAlgo - BST', url: 'https://visualgo.net/en/bst', type: 'TUTORIAL', description: 'Interactive BST visualization' },
      { title: 'Tree Traversals Explained', url: 'https://www.youtube.com/watch?v=WLvU5EQVZqY', type: 'VIDEO', description: 'All tree traversals explained' },
    ],
    practiceExercises: ['Implement all three traversals', 'Find height of a tree', 'Check if tree is balanced', 'Implement BST insert and search', 'Find lowest common ancestor'],
    estimatedTime: '4-5 hours'
  },
  'normalization': {
    topicName: 'Database Normalization',
    keyConceptsToLearn: ['1NF - First Normal Form', '2NF - Second Normal Form', '3NF - Third Normal Form', 'BCNF', 'Functional Dependencies', 'Decomposition'],
    resources: [
      { title: 'Database Normalization Explained', url: 'https://www.youtube.com/watch?v=UrYLYV7WSHM', type: 'VIDEO', description: 'Clear normalization walkthrough' },
      { title: 'Normal Forms in DBMS', url: 'https://www.geeksforgeeks.org/normal-forms-in-dbms/', type: 'ARTICLE', description: 'Complete normalization guide' },
      { title: 'Database Design Tutorial', url: 'https://www.studytonight.com/dbms/database-normalization.php', type: 'ARTICLE', description: 'Step-by-step normalization' },
      { title: 'Normalization Practice', url: 'https://www.youtube.com/watch?v=ABwD8IYByfk', type: 'VIDEO', description: 'Solved examples' },
    ],
    practiceExercises: ['Convert an unnormalized table to 1NF', 'Identify functional dependencies', 'Normalize a schema to 3NF', 'Design a normalized database schema'],
    estimatedTime: '3-4 hours'
  },
  'linkedlist': {
    topicName: 'Linked Lists',
    keyConceptsToLearn: ['Singly Linked List', 'Doubly Linked List', 'Circular Linked List', 'Insertion/Deletion Operations', 'Traversal', 'Pointer Manipulation'],
    resources: [
      { title: 'Linked Lists Tutorial', url: 'https://www.youtube.com/watch?v=njTh_OwMljA', type: 'VIDEO', description: 'CS50 Linked Lists explanation' },
      { title: 'Linked List Data Structure', url: 'https://www.geeksforgeeks.org/linked-list-data-structure/', type: 'ARTICLE', description: 'Complete GeeksForGeeks guide' },
      { title: 'VisuAlgo - Linked List', url: 'https://visualgo.net/en/list', type: 'TUTORIAL', description: 'Interactive visualization' },
      { title: 'Linked List Problems', url: 'https://leetcode.com/tag/linked-list/', type: 'TUTORIAL', description: 'Practice problems' },
    ],
    practiceExercises: ['Implement singly linked list', 'Reverse a linked list', 'Detect cycle in linked list', 'Merge two sorted lists', 'Find middle element'],
    estimatedTime: '3-4 hours'
  },
  'stack': {
    topicName: 'Stack Data Structure',
    keyConceptsToLearn: ['LIFO Principle', 'Push/Pop Operations', 'Stack Implementation', 'Applications of Stack', 'Expression Evaluation', 'Parentheses Balancing'],
    resources: [
      { title: 'Stack Data Structure', url: 'https://www.youtube.com/watch?v=I37kGX-nZEI', type: 'VIDEO', description: 'Complete stack tutorial' },
      { title: 'Stack in GeeksForGeeks', url: 'https://www.geeksforgeeks.org/stack-data-structure/', type: 'ARTICLE', description: 'Comprehensive stack guide' },
      { title: 'Stack Problems', url: 'https://leetcode.com/tag/stack/', type: 'TUTORIAL', description: 'Practice stack problems' },
    ],
    practiceExercises: ['Implement stack using array', 'Implement stack using linked list', 'Check balanced parentheses', 'Evaluate postfix expression', 'Implement min stack'],
    estimatedTime: '2-3 hours'
  },
  'queue': {
    topicName: 'Queue Data Structure',
    keyConceptsToLearn: ['FIFO Principle', 'Enqueue/Dequeue Operations', 'Circular Queue', 'Priority Queue', 'Deque', 'Queue Applications'],
    resources: [
      { title: 'Queue Data Structure', url: 'https://www.youtube.com/watch?v=XuCbpw6Bj1U', type: 'VIDEO', description: 'Complete queue tutorial' },
      { title: 'Queue in GeeksForGeeks', url: 'https://www.geeksforgeeks.org/queue-data-structure/', type: 'ARTICLE', description: 'Comprehensive queue guide' },
      { title: 'Queue Problems', url: 'https://leetcode.com/tag/queue/', type: 'TUTORIAL', description: 'Practice queue problems' },
    ],
    practiceExercises: ['Implement queue using array', 'Implement circular queue', 'Implement queue using stacks', 'Design a task scheduler', 'BFS using queue'],
    estimatedTime: '2-3 hours'
  },
  'recursion': {
    topicName: 'Recursion',
    keyConceptsToLearn: ['Base Case', 'Recursive Case', 'Call Stack', 'Tail Recursion', 'Memoization', 'Recursive vs Iterative'],
    resources: [
      { title: 'Recursion Explained', url: 'https://www.youtube.com/watch?v=KEEKn7Me-ms', type: 'VIDEO', description: 'CS Dojo recursion tutorial' },
      { title: 'Recursion Guide', url: 'https://www.geeksforgeeks.org/recursion/', type: 'ARTICLE', description: 'Complete recursion guide' },
      { title: 'Recursion Practice', url: 'https://leetcode.com/tag/recursion/', type: 'TUTORIAL', description: 'Practice recursion problems' },
      { title: 'Thinking Recursively', url: 'https://www.youtube.com/watch?v=YRBi5rp0_Ic', type: 'VIDEO', description: 'How to think recursively' },
    ],
    practiceExercises: ['Implement factorial', 'Implement Fibonacci', 'Tower of Hanoi', 'Generate all permutations', 'Recursive binary search'],
    estimatedTime: '3-4 hours'
  },
  'graph': {
    topicName: 'Graph Data Structure',
    keyConceptsToLearn: ['Graph Terminology', 'Adjacency Matrix/List', 'BFS', 'DFS', 'Shortest Path', 'Cycle Detection'],
    resources: [
      { title: 'Graph Data Structure', url: 'https://www.youtube.com/watch?v=tWVWeAqZ0WU', type: 'VIDEO', description: 'freeCodeCamp graph course' },
      { title: 'Graph in GeeksForGeeks', url: 'https://www.geeksforgeeks.org/graph-data-structure-and-algorithms/', type: 'ARTICLE', description: 'Complete graph guide' },
      { title: 'VisuAlgo - Graph', url: 'https://visualgo.net/en/graphds', type: 'TUTORIAL', description: 'Interactive graph visualization' },
      { title: 'Graph Problems', url: 'https://leetcode.com/tag/graph/', type: 'TUTORIAL', description: 'Practice graph problems' },
    ],
    practiceExercises: ['Implement BFS', 'Implement DFS', 'Detect cycle in graph', 'Find shortest path', 'Check if graph is bipartite'],
    estimatedTime: '5-6 hours'
  },
  'oop': {
    topicName: 'Object-Oriented Programming',
    keyConceptsToLearn: ['Classes & Objects', 'Encapsulation', 'Inheritance', 'Polymorphism', 'Abstraction', 'SOLID Principles'],
    resources: [
      { title: 'OOP Concepts Explained', url: 'https://www.youtube.com/watch?v=pTB0EiLXUC8', type: 'VIDEO', description: 'Complete OOP tutorial' },
      { title: 'OOP in GeeksForGeeks', url: 'https://www.geeksforgeeks.org/object-oriented-programming-oops-concept-in-java/', type: 'ARTICLE', description: 'OOP concepts with examples' },
      { title: 'SOLID Principles', url: 'https://www.youtube.com/watch?v=kF7rQmSRlq0', type: 'VIDEO', description: 'SOLID principles explained' },
      { title: 'Design Patterns', url: 'https://refactoring.guru/design-patterns', type: 'ARTICLE', description: 'Learn design patterns' },
    ],
    practiceExercises: ['Create a class hierarchy', 'Implement polymorphism', 'Design a banking system', 'Apply SOLID principles', 'Implement a design pattern'],
    estimatedTime: '4-5 hours'
  },
  'java': {
    topicName: 'Java Programming',
    keyConceptsToLearn: ['Java Syntax', 'Data Types', 'Control Flow', 'OOP in Java', 'Collections Framework', 'Exception Handling'],
    resources: [
      { title: 'Java Full Course', url: 'https://www.youtube.com/watch?v=eIrMbAQSU34', type: 'VIDEO', description: 'Complete Java course' },
      { title: 'W3Schools Java', url: 'https://www.w3schools.com/java/', type: 'TUTORIAL', description: 'Interactive Java tutorial' },
      { title: 'Java Documentation', url: 'https://docs.oracle.com/javase/tutorial/', type: 'ARTICLE', description: 'Official Oracle tutorials' },
      { title: 'Java Practice', url: 'https://www.hackerrank.com/domains/java', type: 'TUTORIAL', description: 'HackerRank Java problems' },
    ],
    practiceExercises: ['Write basic Java programs', 'Implement collections', 'Handle exceptions properly', 'Build a console application', 'Practice with streams'],
    estimatedTime: '4-5 hours'
  },
  'python': {
    topicName: 'Python Programming',
    keyConceptsToLearn: ['Python Syntax', 'Data Types', 'Functions', 'List Comprehensions', 'File I/O', 'Libraries'],
    resources: [
      { title: 'Python Full Course', url: 'https://www.youtube.com/watch?v=rfscVS0vtbw', type: 'VIDEO', description: 'freeCodeCamp Python course' },
      { title: 'W3Schools Python', url: 'https://www.w3schools.com/python/', type: 'TUTORIAL', description: 'Interactive Python tutorial' },
      { title: 'Python Documentation', url: 'https://docs.python.org/3/tutorial/', type: 'ARTICLE', description: 'Official Python tutorial' },
      { title: 'Python Practice', url: 'https://www.hackerrank.com/domains/python', type: 'TUTORIAL', description: 'HackerRank Python problems' },
    ],
    practiceExercises: ['Write Python scripts', 'Work with lists and dictionaries', 'Implement file operations', 'Use list comprehensions', 'Build a small project'],
    estimatedTime: '3-4 hours'
  },
  'searching': {
    topicName: 'Searching Algorithms',
    keyConceptsToLearn: ['Linear Search', 'Binary Search', 'Search in Sorted Arrays', 'Search Space', 'Time Complexity'],
    resources: [
      { title: 'Searching Algorithms', url: 'https://www.youtube.com/watch?v=s6kcVWchDRM', type: 'VIDEO', description: 'Complete searching tutorial' },
      { title: 'Binary Search Guide', url: 'https://www.geeksforgeeks.org/binary-search/', type: 'ARTICLE', description: 'Binary search explained' },
      { title: 'Searching Problems', url: 'https://leetcode.com/tag/binary-search/', type: 'TUTORIAL', description: 'Practice binary search' },
    ],
    practiceExercises: ['Implement linear search', 'Implement binary search', 'Search in rotated array', 'Find first/last occurrence', 'Search in 2D matrix'],
    estimatedTime: '2-3 hours'
  },
  'hashing': {
    topicName: 'Hashing & Hash Tables',
    keyConceptsToLearn: ['Hash Functions', 'Hash Tables', 'Collision Handling', 'HashMaps', 'HashSets', 'Applications'],
    resources: [
      { title: 'Hash Tables Explained', url: 'https://www.youtube.com/watch?v=KyUTuwz_b7Q', type: 'VIDEO', description: 'CS50 hash tables' },
      { title: 'Hashing in GeeksForGeeks', url: 'https://www.geeksforgeeks.org/hashing-data-structure/', type: 'ARTICLE', description: 'Complete hashing guide' },
      { title: 'Hash Table Problems', url: 'https://leetcode.com/tag/hash-table/', type: 'TUTORIAL', description: 'Practice hash table problems' },
    ],
    practiceExercises: ['Implement a hash table', 'Two Sum using hash map', 'Find duplicates using set', 'Group anagrams', 'Implement LRU cache'],
    estimatedTime: '3-4 hours'
  },
  'dynamic': {
    topicName: 'Dynamic Programming',
    keyConceptsToLearn: ['Overlapping Subproblems', 'Optimal Substructure', 'Memoization', 'Tabulation', 'State Transition'],
    resources: [
      { title: 'Dynamic Programming Tutorial', url: 'https://www.youtube.com/watch?v=oBt53YbR9Kk', type: 'VIDEO', description: 'freeCodeCamp DP course' },
      { title: 'DP Guide', url: 'https://www.geeksforgeeks.org/dynamic-programming/', type: 'ARTICLE', description: 'Complete DP guide' },
      { title: 'DP Problems', url: 'https://leetcode.com/tag/dynamic-programming/', type: 'TUTORIAL', description: 'Practice DP problems' },
    ],
    practiceExercises: ['Fibonacci with memoization', 'Coin change problem', 'Longest common subsequence', 'Knapsack problem', '0/1 Knapsack'],
    estimatedTime: '6-8 hours'
  },
};

const ResultView: React.FC<Props> = ({ result, onReset }) => {
  const [aiRecommendations, setAiRecommendations] = useState<AIRecommendation[]>([]);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [retryCountdown, setRetryCountdown] = useState<number>(0);
  const [usingFallback, setUsingFallback] = useState(false);
  const [quotaExhausted, setQuotaExhausted] = useState(false);
  const [nextRetryTime, setNextRetryTime] = useState<number>(0);
  const [currentProvider, setCurrentProvider] = useState<'gemini' | 'groq'>('gemini');
  const countdownRef = useRef<NodeJS.Timeout | null>(null);

  const chartData = result.breakdown.map(b => ({
    topic: b.topicName,
    score: b.percentage,
    full: 100
  }));

  // Get gap topics for AI recommendations
  const gapTopics = result.gaps.map(gap => {
    const topic = result.breakdown.find(b => b.topicId === gap.topicId);
    return {
      name: topic?.topicName || 'Unknown Topic',
      score: gap.weaknessScore
    };
  });

  // State to track if user wants AI recommendations
  const [showAISection, setShowAISection] = useState(false);

  // Cleanup countdown on unmount
  useEffect(() => {
    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, []);

  // Function to request AI recommendations
  const requestAIRecommendations = () => {
    setShowAISection(true);
    generateAIRecommendations();
  };

  // Helper function to call Groq API
  const callGroqAPI = async (prompt: string): Promise<string> => {
    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant', // Fast and free model
        messages: [
          {
            role: 'system',
            content: 'You are an expert educational AI assistant. Always respond with valid JSON only, no markdown formatting.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 4096,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Groq API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || '';
  };

  const generateAIRecommendations = async () => {
    // Check if we should wait before retrying due to quota limits
    const now = Date.now();
    if (quotaExhausted && currentProvider === 'gemini' && nextRetryTime > now) {
      // Try Groq instead if Gemini quota is exhausted
      if (GROQ_API_KEY) {
        setCurrentProvider('groq');
      } else {
        const waitSeconds = Math.ceil((nextRetryTime - now) / 1000);
        setAiError(`API quota exceeded. Please wait ${waitSeconds} seconds before retrying, or use the curated recommendations below.`);
        useFallbackRecommendations();
        return;
      }
    }

    setIsLoadingAI(true);
    setAiError(null);
    setUsingFallback(false);

    const topicsListStr = gapTopics.map(t => `- ${t.name} (current score: ${t.score.toFixed(0)}%)`).join('\n');
      
    const prompt = `
You are an expert educational AI assistant. A student has completed an assessment and has knowledge gaps in the following topics:

${topicsListStr}

For EACH topic listed above, generate a comprehensive learning recommendation. Your response MUST be a valid JSON array with the following structure for each topic:

[
  {
    "topicName": "Name of the topic",
    "keyConceptsToLearn": ["concept1", "concept2", "concept3"],
    "resources": [
      {
        "title": "Resource title",
        "url": "https://actual-working-url.com",
        "type": "VIDEO",
        "description": "Brief description"
      },
      {
        "title": "Another resource",
        "url": "https://another-url.com",
        "type": "ARTICLE",
        "description": "Brief description"
      }
    ],
    "practiceExercises": ["exercise1", "exercise2"],
    "estimatedTime": "2-3 hours"
  }
]

IMPORTANT REQUIREMENTS:
1. Provide REAL, WORKING URLs from reputable sources like:
   - YouTube (youtube.com/watch?v=...)
   - GeeksForGeeks (geeksforgeeks.org)
   - W3Schools (w3schools.com)
   - MDN (developer.mozilla.org)
   - freeCodeCamp (freecodecamp.org)
   - Khan Academy (khanacademy.org)
   - Coursera (coursera.org)
   - LeetCode (leetcode.com)
   - HackerRank (hackerrank.com)

2. Include at least 3-4 resources per topic (mix of videos and articles)
3. Be specific with concepts - don't be generic
4. Provide practical exercises they can do
5. Return ONLY the JSON array, no other text or markdown formatting
`;

    try {
      let responseText = '';
      
      // Try current provider
      if (currentProvider === 'gemini') {
        try {
          const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
          const response = await ai.models.generateContent({
            model: 'gemini-2.0-flash',
            contents: prompt,
          });
          responseText = response.text || '';
        } catch (geminiError: any) {
          const errorMessage = geminiError?.message || geminiError?.toString() || '';
          
          // If Gemini fails with quota error, try Groq as fallback
          if (errorMessage.includes('429') || errorMessage.includes('quota') || errorMessage.includes('RESOURCE_EXHAUSTED')) {
            console.log('Gemini quota exceeded, trying Groq...');
            setQuotaExhausted(true);
            setNextRetryTime(Date.now() + 60000);
            
            // Try Groq if API key is configured
            if (GROQ_API_KEY) {
              setCurrentProvider('groq');
              responseText = await callGroqAPI(prompt);
            } else {
              throw geminiError; // Re-throw if no Groq key
            }
          } else {
            throw geminiError;
          }
        }
      } else {
        // Use Groq
        responseText = await callGroqAPI(prompt);
      }
      
      // Parse JSON from response (handle potential markdown wrapping)
      let jsonStr = responseText;
      if (responseText.includes('```json')) {
        jsonStr = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      } else if (responseText.includes('```')) {
        jsonStr = responseText.replace(/```\n?/g, '');
      }
      
      const recommendations: AIRecommendation[] = JSON.parse(jsonStr.trim());
      setAiRecommendations(recommendations);
      setQuotaExhausted(false); // Reset on success
    } catch (error: any) {
      console.error('AI Recommendation Error:', error);
      
      // Check if it's a rate limit error (429) or any other error
      const errorMessage = error?.message || error?.toString() || '';
      if (errorMessage.includes('429') || errorMessage.includes('quota') || errorMessage.includes('RESOURCE_EXHAUSTED')) {
        // Set quota exhausted flag and calculate retry time (60 seconds cooldown)
        setQuotaExhausted(true);
        const retryDelay = 60000; // 60 seconds
        setNextRetryTime(Date.now() + retryDelay);
        setAiError('All AI providers quota exceeded. Showing curated expert recommendations instead.');
      } else {
        setAiError('AI unavailable. Showing curated expert recommendations.');
      }
      
      // Fall back to curated recommendations immediately
      useFallbackRecommendations();
    } finally {
      setIsLoadingAI(false);
    }
  };

  const useFallbackRecommendations = () => {
    setUsingFallback(true);
    const fallbackRecs: AIRecommendation[] = gapTopics.map(topic => {
      const topicLower = topic.name.toLowerCase();
      
      // Match topic to comprehensive fallback recommendations
      if (topicLower.includes('array')) {
        return { ...FALLBACK_RECOMMENDATIONS['arrays'], topicName: topic.name };
      } else if (topicLower.includes('sql') || topicLower.includes('query') || topicLower.includes('database')) {
        return { ...FALLBACK_RECOMMENDATIONS['sql'], topicName: topic.name };
      } else if (topicLower.includes('sort')) {
        return { ...FALLBACK_RECOMMENDATIONS['sorting'], topicName: topic.name };
      } else if (topicLower.includes('tree') || topicLower.includes('binary')) {
        return { ...FALLBACK_RECOMMENDATIONS['trees'], topicName: topic.name };
      } else if (topicLower.includes('normal') || topicLower.includes('1nf') || topicLower.includes('2nf') || topicLower.includes('3nf')) {
        return { ...FALLBACK_RECOMMENDATIONS['normalization'], topicName: topic.name };
      } else if (topicLower.includes('linked') || topicLower.includes('list')) {
        return { ...FALLBACK_RECOMMENDATIONS['linkedlist'], topicName: topic.name };
      } else if (topicLower.includes('stack')) {
        return { ...FALLBACK_RECOMMENDATIONS['stack'], topicName: topic.name };
      } else if (topicLower.includes('queue')) {
        return { ...FALLBACK_RECOMMENDATIONS['queue'], topicName: topic.name };
      } else if (topicLower.includes('recurs')) {
        return { ...FALLBACK_RECOMMENDATIONS['recursion'], topicName: topic.name };
      } else if (topicLower.includes('graph')) {
        return { ...FALLBACK_RECOMMENDATIONS['graph'], topicName: topic.name };
      } else if (topicLower.includes('oop') || topicLower.includes('object') || topicLower.includes('class') || topicLower.includes('inherit')) {
        return { ...FALLBACK_RECOMMENDATIONS['oop'], topicName: topic.name };
      } else if (topicLower.includes('java') && !topicLower.includes('javascript')) {
        return { ...FALLBACK_RECOMMENDATIONS['java'], topicName: topic.name };
      } else if (topicLower.includes('python')) {
        return { ...FALLBACK_RECOMMENDATIONS['python'], topicName: topic.name };
      } else if (topicLower.includes('search')) {
        return { ...FALLBACK_RECOMMENDATIONS['searching'], topicName: topic.name };
      } else if (topicLower.includes('hash')) {
        return { ...FALLBACK_RECOMMENDATIONS['hashing'], topicName: topic.name };
      } else if (topicLower.includes('dynamic') || topicLower.includes('dp') || topicLower.includes('memoiz')) {
        return { ...FALLBACK_RECOMMENDATIONS['dynamic'], topicName: topic.name };
      } else {
        return { ...FALLBACK_RECOMMENDATIONS['default'], topicName: topic.name };
      }
    });
    
    setAiRecommendations(fallbackRecs);
  };

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'VIDEO': return 'fa-play-circle';
      case 'ARTICLE': return 'fa-file-alt';
      case 'TUTORIAL': return 'fa-code';
      default: return 'fa-link';
    }
  };

  const getResourceColor = (type: string) => {
    switch (type) {
      case 'VIDEO': return 'bg-red-100 text-red-600';
      case 'ARTICLE': return 'bg-blue-100 text-blue-600';
      case 'TUTORIAL': return 'bg-green-100 text-green-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div className="space-y-10 pb-20">
      <div className="bg-white rounded-3xl p-10 shadow-xl border border-blue-50 text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 p-10 opacity-10">
          <i className="fas fa-award text-9xl text-blue-600"></i>
        </div>
        <h1 className="text-4xl font-black text-gray-900 mb-2">Assessment Completed!</h1>
        <div className="text-6xl font-black text-blue-600 mb-4">{result.percentage.toFixed(1)}%</div>
        <p className="text-gray-500 max-w-md mx-auto">
          We've analyzed your performance across {result.breakdown.length} topics. 
          See your knowledge footprint below.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-2xl border shadow-sm h-[400px]">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
            <i className="fas fa-chart-pie text-blue-500"></i>
            Knowledge Footprint
          </h3>
          <ResponsiveContainer width="100%" height="80%">
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="topic" />
              <Radar name="Student Score" dataKey="score" stroke="#2563eb" fill="#3b82f6" fillOpacity={0.6} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-8 rounded-2xl border shadow-sm">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
            <i className="fas fa-exclamation-triangle text-orange-500"></i>
            Identified Knowledge Gaps
          </h3>
          <div className="space-y-4">
            {result.gaps.length > 0 ? result.gaps.map((gap, i) => {
              const topic = result.breakdown.find(b => b.topicId === gap.topicId);
              return (
                <div key={i} className="flex items-center justify-between p-4 bg-orange-50 border border-orange-100 rounded-xl">
                  <div>
                    <h4 className="font-bold text-orange-900">{topic?.topicName}</h4>
                    <p className="text-sm text-orange-700">Needs significant improvement</p>
                  </div>
                  <div className="text-xl font-black text-orange-600">{gap.weaknessScore.toFixed(0)}%</div>
                </div>
              );
            }) : (
              <div className="p-8 text-center bg-green-50 rounded-xl text-green-700">
                <i className="fas fa-check-circle text-3xl mb-2"></i>
                <p>Excellent! No critical gaps detected.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Topic Performance Breakdown */}
      <div className="bg-white p-8 rounded-2xl border shadow-sm">
        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
          <i className="fas fa-list-check text-green-500"></i>
          Topic-wise Performance
        </h3>
        <div className="space-y-4">
          {result.breakdown.map((topic, i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="flex-grow">
                <div className="flex justify-between mb-1">
                  <span className="font-medium text-gray-700">{topic.topicName}</span>
                  <span className="font-bold text-gray-900">{topic.correct}/{topic.total} ({topic.percentage.toFixed(0)}%)</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${
                      topic.percentage >= 60 ? 'bg-green-500' : 'bg-orange-500'
                    }`}
                    style={{ width: `${topic.percentage}%` }}
                  ></div>
                </div>
              </div>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                topic.percentage >= 60 ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'
              }`}>
                <i className={`fas ${topic.percentage >= 60 ? 'fa-check' : 'fa-exclamation'}`}></i>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA for AI Recommendations - Only show if there are gaps */}
      {result.gaps.length > 0 && !showAISection && (
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-8 rounded-[2rem] shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-2xl"></div>
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center">
                <i className="fas fa-robot text-3xl text-white"></i>
              </div>
              <div>
                <h3 className="text-2xl font-black text-white">Need Help Improving?</h3>
                <p className="text-indigo-100">Get AI-powered personalized recommendations to bridge your knowledge gaps</p>
              </div>
            </div>
            <button
              onClick={requestAIRecommendations}
              className="bg-white text-indigo-600 px-8 py-4 rounded-xl font-black text-lg hover:bg-indigo-50 transition shadow-lg flex items-center gap-3 whitespace-nowrap"
            >
              <i className="fas fa-magic"></i>
              Get AI Recommendations
            </button>
          </div>
        </div>
      )}

      {/* AI-Powered Recommendations Section - Only show when requested */}
      {result.gaps.length > 0 && showAISection && (
        <div className="bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-900 p-10 rounded-[3rem] shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/20 rounded-full -mr-48 -mt-48 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/20 rounded-full -ml-32 -mb-32 blur-3xl"></div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-14 h-14 bg-white/10 backdrop-blur rounded-2xl flex items-center justify-center">
                <i className={`fas ${usingFallback ? 'fa-book-open' : 'fa-robot'} text-2xl text-white`}></i>
              </div>
              <div>
                <h3 className="text-2xl font-black text-white">
                  {usingFallback ? 'Curated Learning Path' : 'AI-Powered Learning Path'}
                </h3>
                <p className="text-indigo-200 text-sm">
                  {usingFallback 
                    ? 'Expert-curated recommendations for your knowledge gaps' 
                    : 'Personalized recommendations powered by Gemini AI'}
                </p>
              </div>
            </div>

            {isLoadingAI ? (
              <div className="bg-white/5 backdrop-blur rounded-[2rem] p-16 text-center">
                <div className="relative inline-block mb-6">
                  <div className="w-20 h-20 bg-white/10 rounded-[1.5rem] animate-pulse flex items-center justify-center">
                    <i className="fas fa-brain text-3xl text-white animate-bounce"></i>
                  </div>
                </div>
                <h4 className="text-xl font-bold text-white mb-2">Analyzing Your Knowledge Gaps...</h4>
                <p className="text-indigo-200">Our AI is generating personalized learning resources for you</p>
              </div>
            ) : (
              <div className="space-y-8">
                {/* Show fallback notice if using fallback */}
                {usingFallback && (
                  <div className="bg-yellow-500/20 backdrop-blur rounded-xl p-4 flex items-center gap-4 border border-yellow-400/30">
                    <i className="fas fa-info-circle text-yellow-300 text-xl"></i>
                    <div>
                      <p className="text-yellow-100 font-medium">Using curated recommendations</p>
                      <p className="text-yellow-200/70 text-sm">AI service is temporarily unavailable. Showing expert-curated resources instead.</p>
                    </div>
                  </div>
                )}
                
                {aiRecommendations.map((rec, idx) => (
                  <div key={idx} className="bg-white/10 backdrop-blur rounded-[2rem] p-8 border border-white/10">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h4 className="text-xl font-black text-white">{rec.topicName}</h4>
                        <p className="text-indigo-200 text-sm">
                          <i className="fas fa-clock mr-2"></i>
                          Estimated learning time: {rec.estimatedTime}
                        </p>
                      </div>
                      <div className="bg-orange-500/20 text-orange-300 px-4 py-2 rounded-xl text-sm font-bold">
                        <i className="fas fa-fire mr-2"></i>Priority Topic
                      </div>
                    </div>

                    {/* Key Concepts */}
                    <div className="mb-6">
                      <h5 className="text-sm font-bold text-indigo-300 uppercase tracking-wider mb-3">
                        <i className="fas fa-lightbulb mr-2"></i>Key Concepts to Master
                      </h5>
                      <div className="flex flex-wrap gap-2">
                        {rec.keyConceptsToLearn.map((concept, i) => (
                          <span key={i} className="bg-white/10 text-white px-4 py-2 rounded-xl text-sm font-medium">
                            {concept}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Resources */}
                    <div className="mb-6">
                      <h5 className="text-sm font-bold text-indigo-300 uppercase tracking-wider mb-3">
                        <i className="fas fa-book-open mr-2"></i>Learning Resources
                      </h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {rec.resources.map((resource, i) => (
                          <a
                            key={i}
                            href={resource.url}
                            target="_blank"
                            rel="noreferrer"
                            className="group bg-white rounded-xl p-4 hover:shadow-xl transition-all hover:scale-[1.02] flex items-start gap-4"
                          >
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${getResourceColor(resource.type)}`}>
                              <i className={`fas ${getResourceIcon(resource.type)} text-xl`}></i>
                            </div>
                            <div className="flex-grow min-w-0">
                              <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                                {resource.type}
                              </div>
                              <h6 className="font-bold text-gray-900 group-hover:text-indigo-600 transition truncate">
                                {resource.title}
                              </h6>
                              <p className="text-sm text-gray-500 line-clamp-2">{resource.description}</p>
                            </div>
                            <i className="fas fa-external-link-alt text-gray-300 group-hover:text-indigo-500 transition shrink-0"></i>
                          </a>
                        ))}
                      </div>
                    </div>

                    {/* Practice Exercises */}
                    <div>
                      <h5 className="text-sm font-bold text-indigo-300 uppercase tracking-wider mb-3">
                        <i className="fas fa-dumbbell mr-2"></i>Practice Exercises
                      </h5>
                      <div className="space-y-2">
                        {rec.practiceExercises.map((exercise, i) => (
                          <div key={i} className="flex items-center gap-3 bg-white/5 rounded-xl px-4 py-3">
                            <div className="w-6 h-6 bg-green-500/20 text-green-400 rounded-lg flex items-center justify-center text-xs font-bold">
                              {i + 1}
                            </div>
                            <span className="text-white text-sm">{exercise}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}

                <button 
                  onClick={generateAIRecommendations}
                  disabled={isLoadingAI || (quotaExhausted && nextRetryTime > Date.now())}
                  className={`w-full border border-white/20 text-white py-4 rounded-2xl font-bold transition flex items-center justify-center gap-2 ${isLoadingAI || (quotaExhausted && nextRetryTime > Date.now()) ? 'bg-white/5 cursor-not-allowed opacity-50' : 'bg-white/10 hover:bg-white/20'}`}
                >
                  <i className={`fas ${isLoadingAI ? 'fa-spinner fa-spin' : 'fa-sync-alt'}`}></i>
                  {isLoadingAI ? 'Loading...' : usingFallback ? 'Try AI Recommendations Again' : 'Regenerate Recommendations'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Original static recommendations (fallback) */}
      {result.recommendations.length > 0 && result.gaps.length === 0 && (
        <div className="bg-white p-8 rounded-2xl border shadow-sm">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
            <i className="fas fa-lightbulb text-yellow-500"></i>
            Personalized Learning Path
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {result.recommendations.map(rec => (
              <a 
                key={rec.id} 
                href={rec.url} 
                target="_blank" 
                rel="noreferrer"
                className="group flex items-start gap-4 p-4 border rounded-xl hover:border-blue-400 hover:bg-blue-50 transition"
              >
                <div className={`w-12 h-12 flex-shrink-0 rounded-lg flex items-center justify-center ${rec.type === RecommendationType.VIDEO ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                  <i className={`fas ${rec.type === RecommendationType.VIDEO ? 'fa-play' : 'fa-file-alt'}`}></i>
                </div>
                <div>
                  <div className="text-xs font-bold text-gray-400 group-hover:text-blue-500 uppercase tracking-wider mb-1">
                    {rec.type} Resource
                  </div>
                  <h4 className="font-bold text-gray-800">{rec.description}</h4>
                  <p className="text-sm text-gray-500">Click to start learning</p>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      <div className="text-center">
        <button 
          onClick={onReset}
          className="bg-gray-900 text-white px-10 py-4 rounded-xl font-bold hover:bg-blue-600 transition shadow-lg"
        >
          Return to Dashboard
        </button>
      </div>
    </div>
  );
};

export default ResultView;
