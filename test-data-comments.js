#!/usr/bin/env node

import { generateAIComment } from './ai-comment-generator.js';

async function testDataComments() {
  console.log('🧪 Testing Data-Focused Comment Generation...\n');
  
  const testData = {
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
    filename: 'test_000089_0'
  };
  
  try {
    const comment = await generateAIComment(
      testData.sfCounts,
      testData.sfCategories,
      testData.totalPoints,
      testData.filename
    );
    
    console.log(`✅ Generated comment: "${comment}"`);
    console.log(`📊 Word count: ${comment.split(' ').length} words`);
    console.log(`📏 Character count: ${comment.length} characters`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testDataComments();
