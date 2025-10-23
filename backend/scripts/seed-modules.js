const mongoose = require('mongoose');
const LearningModule = require('../src/models/LearningModule');
require('dotenv').config();

// Sample learning modules data
const sampleModules = [
  {
    title: "Money Basics",
    description: "Learn about coins, bills, and how money works",
    ageRange: { min: 5, max: 10 },
    difficultyLevel: "beginner",
    category: "money-basics",
    estimatedDuration: 30,
    content: {
      introduction: "Welcome to Money Basics! In this module, you'll learn all about money - what it is, how we use it, and why it's important.",
      objectives: [
        "Identify different coins and bills",
        "Understand the value of money",
        "Learn how to count money",
        "Practice making change"
      ],
      lessons: [
        {
          id: "lesson-1",
          title: "What is Money?",
          content: "Money is something we use to buy things we need and want. It comes in different forms like coins and paper bills.",
          type: "text",
          order: 1
        },
        {
          id: "lesson-2",
          title: "Coins and Bills",
          content: "Let's learn about different coins: pennies (1¢), nickels (5¢), dimes (10¢), quarters (25¢), and dollar bills ($1).",
          type: "interactive",
          order: 2
        },
        {
          id: "lesson-3",
          title: "Counting Money",
          content: "Practice counting coins and bills to make different amounts of money.",
          type: "quiz",
          order: 3
        }
      ],
      activities: [
        {
          id: "activity-1",
          title: "Coin Sorting Game",
          description: "Sort coins by type and value",
          type: "game",
          questions: [
            {
              question: "Which coin is worth 1 cent?",
              options: ["Penny", "Nickel", "Dime", "Quarter"],
              correct: 0
            },
            {
              question: "How many pennies make a nickel?",
              options: ["2", "3", "5", "10"],
              correct: 2
            }
          ],
          scoring: {
            pointsPerQuestion: 10,
            passingScore: 70
          }
        }
      ],
      resources: [
        {
          title: "Money Counting Worksheet",
          url: "/resources/money-counting.pdf",
          type: "worksheet"
        }
      ]
    },
    isActive: true
  },
  {
    title: "Business Ideas",
    description: "Discover different types of businesses you can start",
    ageRange: { min: 8, max: 14 },
    difficultyLevel: "intermediate",
    category: "business-ideas",
    estimatedDuration: 45,
    content: {
      introduction: "Every great business starts with a great idea! Let's explore different types of businesses and learn how to come up with your own business ideas.",
      objectives: [
        "Identify different types of businesses",
        "Understand what makes a good business idea",
        "Learn about customer needs",
        "Create your own business idea"
      ],
      lessons: [
        {
          id: "lesson-1",
          title: "Types of Businesses",
          content: "There are many different types of businesses: service businesses (like pet care), product businesses (like selling crafts), and food businesses (like lemonade stands).",
          type: "text",
          order: 1
        },
        {
          id: "lesson-2",
          title: "What Makes a Good Business Idea?",
          content: "A good business idea solves a problem or meets a need that people have. It should be something you're interested in and can do well.",
          type: "interactive",
          order: 2
        },
        {
          id: "lesson-3",
          title: "Finding Your Business Idea",
          content: "Think about what you're good at, what you enjoy doing, and what problems you could solve for others.",
          type: "quiz",
          order: 3
        }
      ],
      activities: [
        {
          id: "activity-1",
          title: "Business Idea Generator",
          description: "Use our tool to generate business ideas based on your interests",
          type: "simulation",
          questions: [
            {
              question: "What do you enjoy doing in your free time?",
              options: ["Art and crafts", "Playing with pets", "Cooking", "Technology"],
              correct: null // Multiple correct answers
            }
          ],
          scoring: {
            pointsPerQuestion: 15,
            passingScore: 80
          }
        }
      ],
      resources: [
        {
          title: "Business Idea Worksheet",
          url: "/resources/business-ideas.pdf",
          type: "worksheet"
        }
      ]
    },
    isActive: true
  },
  {
    title: "Saving & Spending",
    description: "Learn how to save money and spend wisely",
    ageRange: { min: 6, max: 12 },
    difficultyLevel: "beginner",
    category: "saving-spending",
    estimatedDuration: 35,
    content: {
      introduction: "Money management is an important skill! Learn the difference between needs and wants, and how to save money for the things you really want.",
      objectives: [
        "Understand the difference between needs and wants",
        "Learn how to save money",
        "Practice making spending decisions",
        "Set savings goals"
      ],
      lessons: [
        {
          id: "lesson-1",
          title: "Needs vs Wants",
          content: "Needs are things we must have to live (like food and clothes), while wants are things we'd like to have (like toys and games).",
          type: "text",
          order: 1
        },
        {
          id: "lesson-2",
          title: "How to Save Money",
          content: "Saving money means putting some money aside instead of spending it all. You can save for something special you want to buy later.",
          type: "interactive",
          order: 2
        },
        {
          id: "lesson-3",
          title: "Making Smart Choices",
          content: "Before you spend money, ask yourself: Do I really need this? Can I afford it? Is there something better I could save for?",
          type: "quiz",
          order: 3
        }
      ],
      activities: [
        {
          id: "activity-1",
          title: "Savings Goal Calculator",
          description: "Calculate how long it will take to save for something you want",
          type: "simulation",
          questions: [
            {
              question: "If you save $5 every week, how long will it take to save $50?",
              options: ["5 weeks", "10 weeks", "15 weeks", "20 weeks"],
              correct: 1
            }
          ],
          scoring: {
            pointsPerQuestion: 20,
            passingScore: 75
          }
        }
      ],
      resources: [
        {
          title: "Savings Tracker",
          url: "/resources/savings-tracker.pdf",
          type: "worksheet"
        }
      ]
    },
    isActive: true
  }
];

// Connect to MongoDB and seed data
const seedModules = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('✅ Connected to MongoDB');

    // Clear existing modules
    await LearningModule.deleteMany({});
    console.log('🗑️ Cleared existing modules');

    // Insert sample modules
    const insertedModules = await LearningModule.insertMany(sampleModules);
    console.log(`✅ Inserted ${insertedModules.length} sample modules`);

    console.log('🎉 Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

// Run the seeding function
seedModules();
