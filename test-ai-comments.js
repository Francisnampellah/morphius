#!/usr/bin/env node

// Load environment variables from .env file
import 'dotenv/config';

import { testAIComment, generateAIComment } from './ai-comment-generator.js';

async function testAIComments() {
  console.log('🤖 Testing AI Comment Generation...\n');
  
  // Test data based on real annotation results
  const testCases = [
    {
      name: 'High Quality Road Scene',
      sfCounts: { 1: 1200, 2: 50, 3: 300, 4: 0, 5: 0, 6: 25, 7: 0 },
      sfCategories: {
        'Road Surface': 1200,
        'Curb': 50,
        'Vehicle': 300,
        'Guard Rails': 0,
        'Protective Barrier': 0,
        'Street Light': 25,
        'Sign and Overhead': 0
      },
      totalPoints: 1575,
      filename: '000089_0_high_quality'
    },
    {
      name: 'Complex Urban Scene',
      sfCounts: { 1: 800, 2: 200, 3: 500, 4: 150, 5: 100, 6: 80, 7: 120 },
      sfCategories: {
        'Road Surface': 800,
        'Curb': 200,
        'Vehicle': 500,
        'Guard Rails': 150,
        'Protective Barrier': 100,
        'Street Light': 80,
        'Sign and Overhead': 120
      },
      totalPoints: 1950,
      filename: '000089_1_complex_urban'
    },
    {
      name: 'Simple Highway Scene',
      sfCounts: { 1: 2000, 2: 0, 3: 50, 4: 0, 5: 0, 6: 10, 7: 0 },
      sfCategories: {
        'Road Surface': 2000,
        'Curb': 0,
        'Vehicle': 50,
        'Guard Rails': 0,
        'Protective Barrier': 0,
        'Street Light': 10,
        'Sign and Overhead': 0
      },
      totalPoints: 2060,
      filename: '000089_2_simple_highway'
    },
    {
      name: 'Poor Quality Data',
      sfCounts: { 0: 500, 1: 100, 2: 50, 3: 25, 4: 0, 5: 0, 6: 0, 7: 0 },
      sfCategories: {
        'other': 500,
        'Road Surface': 100,
        'Curb': 50,
        'Vehicle': 25,
        'Guard Rails': 0,
        'Protective Barrier': 0,
        'Street Light': 0,
        'Sign and Overhead': 0
      },
      totalPoints: 675,
      filename: '000089_3_poor_quality'
    }
  ];

  console.log('📋 Test Cases:');
  testCases.forEach((testCase, index) => {
    console.log(`   ${index + 1}. ${testCase.name} (${testCase.totalPoints} points)`);
  });
  console.log('');

  // Test each case
  for (let i = 0; i < testCases.length; i++) {
    const testCase = testCases[i];
    console.log(`\n🧪 Test Case ${i + 1}: ${testCase.name}`);
    console.log(`   File: ${testCase.filename}`);
    console.log(`   Total Points: ${testCase.totalPoints}`);
    console.log(`   Categories: ${Object.entries(testCase.sfCategories).filter(([_, count]) => count > 0).map(([cat, count]) => `${cat}(${count})`).join(', ')}`);
    
    try {
      const comment = await generateAIComment(
        testCase.sfCounts,
        testCase.sfCategories,
        testCase.totalPoints,
        testCase.filename
      );
      
      console.log(`   🤖 AI Comment: "${comment}"`);
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
    }
    
    // Add delay between requests to avoid rate limiting
    if (i < testCases.length - 1) {
      console.log('   ⏳ Waiting 2 seconds...');
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  console.log('\n✅ AI Comment Generation Test Complete!');
}

// Run the test
testAIComments().catch(error => {
  console.error('❌ Test failed:', error.message);
  process.exit(1);
});
