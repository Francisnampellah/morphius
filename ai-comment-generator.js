#!/usr/bin/env node

// Load environment variables from .env file
import 'dotenv/config';

import { HfInference } from '@huggingface/inference';

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  red: '\x1b[31m'
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

// Initialize Hugging Face client
let hf = null;

function initializeHuggingFace() {
  try {
    const apiKey = process.env.HUGGINGFACE_API_KEY;
    if (!apiKey) {
      log('⚠️  HUGGINGFACE_API_KEY not found, AI comments disabled', colors.yellow);
      return false;
    }
    
    hf = new HfInference(apiKey);
    log('✅ Hugging Face AI initialized successfully', colors.green);
    return true;
  } catch (error) {
    log(`❌ Error initializing Hugging Face: ${error.message}`, colors.red);
    return false;
  }
}

/**
 * Generate an intelligent comment based on SF analysis results
 * @param {Object} sfCounts - SF value counts
 * @param {Object} sfCategories - SF categories with counts
 * @param {number} totalPoints - Total number of points
 * @param {string} filename - Name of the processed file
 * @returns {Promise<string>} - AI-generated comment
 */
async function generateAIComment(sfCounts, sfCategories, totalPoints, filename) {
  try {
    if (!hf) {
      const initialized = initializeHuggingFace();
      if (!initialized) {
        return generateFallbackComment(sfCounts, sfCategories, totalPoints);
      }
    }

    // Prepare data for AI analysis
    const analysisData = {
      filename: filename,
      totalPoints: totalPoints,
      categories: sfCategories,
      dominantCategory: getDominantCategory(sfCategories),
      dataQuality: assessDataQuality(sfCounts, totalPoints),
      complexity: assessComplexity(sfCounts)
    };

    // Create a detailed prompt for the AI
    const prompt = createAnalysisPrompt(analysisData);

    log(`🤖 Generating AI comment for ${filename}...`, colors.blue);

    // Use a text generation model (you can change this to any model you prefer)
    const model = process.env.HUGGINGFACE_MODEL || 'Qwen/Qwen3-Next-80B-A3B-Instruct';
    
    let response;
    let isConversationalModel = false;
    
    try {
      // First try text generation (for standard models)
      response = await hf.textGeneration({
        model: model,
        inputs: prompt,
        parameters: {
          max_new_tokens: 20,
          temperature: 0.3,
          do_sample: true,
          return_full_text: false
        }
      });
    } catch (textGenError) {
      // If text generation fails, try chat completion API
      if (textGenError.message.includes('not supported') && textGenError.message.includes('conversational')) {
        log(`   Switching to chat completion API for model: ${model}`, colors.yellow);
        try {
          response = await hf.chatCompletion({
            model: model,
            messages: [
              {
                role: 'system',
                content: 'You are analyzing point cloud data characteristics. Comment on the data features, surface categories, and point distribution patterns (minimum 10 words). Focus on data properties, not annotation quality.'
              },
              {
                role: 'user',
                content: prompt
              }
            ],
            max_tokens: 20,
            temperature: 0.3
          });
          isConversationalModel = true;
        } catch (chatError) {
          throw new Error(`Both text generation and chat completion APIs failed: ${chatError.message}`);
        }
      } else {
        throw textGenError;
      }
    }

    // Handle different response formats
    const aiComment = isConversationalModel 
      ? response.choices[0].message.content.trim()
      : response.generated_text.trim();
    
    // Clean up the response and ensure it's appropriate
    const cleanedComment = cleanAIResponse(aiComment);
    
    log(`✅ AI comment generated: "${cleanedComment}"`, colors.green);
    return cleanedComment;

  } catch (error) {
    log(`⚠️  AI comment generation failed: ${error.message}`, colors.yellow);
    log(`   Falling back to rule-based comment`, colors.yellow);
    return generateFallbackComment(sfCounts, sfCategories, totalPoints);
  }
}

/**
 * Create a detailed prompt for AI analysis
 * @param {Object} analysisData - Analysis data
 * @returns {string} - Formatted prompt
 */
function createAnalysisPrompt(analysisData) {
  const { filename, totalPoints, categories, dominantCategory, dataQuality, complexity } = analysisData;
  
  // Create detailed category breakdown for the prompt
  const categoryBreakdown = Object.entries(categories)
    .filter(([_, count]) => count > 0)
    .map(([cat, count]) => `${cat}: ${count}`)
    .join(', ');
  
  return `Data analysis: ${totalPoints} points, categories: ${categoryBreakdown}, dominant: ${dominantCategory}. Comment on data characteristics (minimum 10 words):`;
}

/**
 * Get the dominant category from SF analysis
 * @param {Object} sfCategories - SF categories with counts
 * @returns {string} - Dominant category name
 */
function getDominantCategory(sfCategories) {
  let maxCount = 0;
  let dominantCategory = 'unknown';
  
  for (const [category, count] of Object.entries(sfCategories)) {
    if (count > maxCount) {
      maxCount = count;
      dominantCategory = category;
    }
  }
  
  return dominantCategory;
}

/**
 * Assess data quality based on SF counts
 * @param {Object} sfCounts - SF value counts
 * @param {number} totalPoints - Total points
 * @returns {string} - Quality assessment
 */
function assessDataQuality(sfCounts, totalPoints) {
  const validSfValues = Object.keys(sfCounts).filter(sf => parseInt(sf) >= 0 && parseInt(sf) <= 7);
  const validPoints = validSfValues.reduce((sum, sf) => sum + sfCounts[sf], 0);
  const qualityRatio = validPoints / totalPoints;
  
  if (qualityRatio >= 0.95) return 'Excellent';
  if (qualityRatio >= 0.85) return 'Good';
  if (qualityRatio >= 0.70) return 'Fair';
  return 'Poor';
}

/**
 * Assess complexity based on category distribution
 * @param {Object} sfCounts - SF value counts
 * @returns {string} - Complexity assessment
 */
function assessComplexity(sfCounts) {
  const activeCategories = Object.values(sfCounts).filter(count => count > 0).length;
  
  if (activeCategories >= 6) return 'High';
  if (activeCategories >= 4) return 'Medium';
  return 'Low';
}

/**
 * Clean AI response to ensure it's appropriate
 * @param {string} response - Raw AI response
 * @returns {string} - Cleaned response
 */
function cleanAIResponse(response) {
  // Remove any unwanted characters or phrases
  let cleaned = response
    .replace(/[^\w\s.,!?-]/g, '') // Remove special characters except basic punctuation
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();
  
  // Remove common prefixes that models might add
  cleaned = cleaned.replace(/^(comment|result|answer|response)[:\s]*/i, '');
  cleaned = cleaned.replace(/^(the|a|an)\s+/i, '');
  
  // Ensure minimum 10 words
  const words = cleaned.split(/\s+/).filter(word => word.length > 0);
  if (words.length < 10) {
    // If too short, add data-focused words
    const dataWords = ['data', 'shows', 'surface', 'features', 'with', 'point', 'distribution', 'patterns'];
    const additionalWords = dataWords.slice(0, 10 - words.length);
    cleaned = words.concat(additionalWords).join(' ');
  }
  
  // Ensure it's not empty and has meaningful content
  if (!cleaned || cleaned.length < 10) {
    return 'Data shows surface features with point distribution patterns across multiple categories';
  }
  
  return cleaned;
}

/**
 * Generate fallback comment when AI is not available
 * @param {Object} sfCounts - SF value counts
 * @param {Object} sfCategories - SF categories with counts
 * @param {number} totalPoints - Total points
 * @returns {string} - Rule-based comment
 */
function generateFallbackComment(sfCounts, sfCategories, totalPoints) {
  const dominantCategory = getDominantCategory(sfCategories);
  const dataQuality = assessDataQuality(sfCounts, totalPoints);
  const complexity = assessComplexity(sfCounts);
  
  // Generate data-focused comments about surface features and categories (minimum 10 words)
  const activeCategories = Object.entries(sfCategories).filter(([_, count]) => count > 0);
  const categoryNames = activeCategories.map(([cat, _]) => cat).join(', ');
  
  if (complexity === 'High') {
    return `Data contains ${activeCategories.length} surface categories including ${categoryNames} with complex feature distribution patterns`;
  } else if (complexity === 'Low') {
    return `Data shows simple surface structure with ${categoryNames} categories and straightforward point distribution patterns`;
  } else {
    return `Data exhibits mixed surface features with ${categoryNames} categories and moderate point density distribution`;
  }
}

/**
 * Test AI comment generation
 * @param {Object} testData - Test data
 * @returns {Promise<string>} - Generated comment
 */
async function testAIComment(testData = null) {
  if (!testData) {
    testData = {
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
  }
  
  log('🧪 Testing AI comment generation...', colors.blue);
  const comment = await generateAIComment(
    testData.sfCounts,
    testData.sfCategories,
    testData.totalPoints,
    testData.filename
  );
  
  log(`📝 Generated comment: "${comment}"`, colors.cyan);
  return comment;
}

// Export functions
export {
  initializeHuggingFace,
  generateAIComment,
  testAIComment,
  generateFallbackComment
};

// If this file is run directly, test the AI comment generation
if (import.meta.url === `file://${process.argv[1]}`) {
  testAIComment().catch(error => {
    log(`❌ Test failed: ${error.message}`, colors.red);
    process.exit(1);
  });
}
