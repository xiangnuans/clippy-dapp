/**
 * Test Data Generation Script
 * For quickly generating test data in development environment
 * Note: This script adds test data to the database, use with caution in production
 * Updated: 2025/04/04 - Supports latest entity structure and file handling logic
 */

const { MongoClient, ObjectId } = require('mongodb');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const crypto = require('crypto');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Get MongoDB connection URL
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/clippy';

// Test wallet address (replace with your own test wallet if needed)
const TEST_WALLET_ADDRESS = '0x9a10f0e7d3efae5dad6a73cb7e53a8a6c3aaeebf72db5fc6b48b19d5b973a15b';

// Base URL for API
const BASE_URL = process.env.BASE_URL || 'http://localhost:5471';

// Sample user data
const testUsers = [
  {
    walletAddress: TEST_WALLET_ADDRESS,
    username: 'Test User',
    email: 'test@example.com',
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

// Sample Agent data (to be associated with sample users)
const testAgents = [
  {
    name: 'Financial Analyst',
    industry: 'Finance',
    description: 'AI assistant focused on financial market analysis and investment advice',
    isActive: true,
    score: 85, // Rating field (0-100)
    feedback: 'This is an excellent financial analysis assistant that provides valuable market insights',
    ratedAt: new Date(Date.now() - 3600000), // Rating time (1 hour ago)
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: 'Marketing Strategist',
    industry: 'Marketing',
    description: 'AI assistant that helps formulate and optimize marketing strategies',
    isActive: true,
    score: 72, // Rating field (0-100)
    feedback: 'Marketing advice has depth but sometimes lacks innovation',
    ratedAt: new Date(Date.now() - 7200000), // Rating time (2 hours ago)
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: 'Product Design Consultant',
    industry: 'Design',
    description: 'AI assistant providing creativity and suggestions for product design',
    isActive: true,
    score: null, // Not yet rated
    feedback: null,
    ratedAt: null,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

// Check and create upload directory
function ensureUploadDirectoryExists() {
  const uploadDir = path.join(__dirname, '../uploads');
  if (!fs.existsSync(uploadDir)) {
    console.log(`Creating upload directory: ${uploadDir}`);
    fs.mkdirSync(uploadDir, { recursive: true });
  }
  return uploadDir;
}

// Create test file
function createTestFile(uploadDir, filename, content = 'This is a test file content.') {
  const filePath = path.join(uploadDir, filename);
  fs.writeFileSync(filePath, content);
  return {
    path: filePath,
    size: fs.statSync(filePath).size
  };
}

// Generate test document data
function generateTestDocuments(agentIds) {
  const uploadDir = ensureUploadDirectoryExists();
  const testDocs = [];
  
  // Create test documents for each agent
  agentIds.forEach(agentId => {
    // Create PDF test file
    const pdfFilename = `test_${crypto.randomBytes(8).toString('hex')}.pdf`;
    const pdfFile = createTestFile(uploadDir, pdfFilename, '%PDF-1.5\nTest PDF content\n%%EOF');
    
    testDocs.push({
      name: 'Quarterly Financial Report',
      description: 'Q1 2025 Financial Analysis Report',
      fileName: pdfFilename,
      filePath: pdfFile.path,
      fileSize: pdfFile.size,
      fileType: 'pdf',
      agent: agentId,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    // Create JPG test file
    const jpgFilename = `test_${crypto.randomBytes(8).toString('hex')}.jpg`;
    const jpgFile = createTestFile(uploadDir, jpgFilename, 'JFIF test image content');
    
    testDocs.push({
      name: 'Product Design Sketch',
      description: 'Latest product design concept drawing',
      fileName: jpgFilename,
      filePath: jpgFile.path,
      fileSize: jpgFile.size,
      fileType: 'jpg',
      agent: agentId,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    // Add more file types to test file controller and download functionality
    // Create TXT test file
    const txtFilename = `test_${crypto.randomBytes(8).toString('hex')}.txt`;
    const txtFile = createTestFile(uploadDir, txtFilename, 'This is a simple text file for testing the file download functionality.');
    
    testDocs.push({
      name: 'Project Description',
      description: 'Basic introduction and explanation of the project',
      fileName: txtFilename,
      filePath: txtFile.path,
      fileSize: txtFile.size,
      fileType: 'txt',
      agent: agentId,
      createdAt: new Date(),
      updatedAt: new Date()
    });
  });
  
  return testDocs;
}

// Clean up existing test data
async function cleanupExistingData(db) {
  console.log('🧹 Cleaning up existing test data...');
  
  // Find users with test wallet address
  const existingUsers = await db.collection('users').find({ walletAddress: TEST_WALLET_ADDRESS }).toArray();
  
  if (existingUsers.length === 0) {
    console.log('✅ No existing test data found');
    return;
  }
  
  // Get user IDs
  const userIds = existingUsers.map(user => user._id);
  console.log(`Found ${userIds.length} existing test users`);
  
  // Find agents owned by these users
  const existingAgents = await db.collection('agents').find({ owner: { $in: userIds } }).toArray();
  const agentIds = existingAgents.map(agent => agent._id);
  console.log(`Found ${agentIds.length} existing test agents`);
  
  // Find documents associated with these agents
  const existingDocs = await db.collection('documents').find({ agent: { $in: agentIds } }).toArray();
  console.log(`Found ${existingDocs.length} existing test documents`);
  
  // Delete files from disk
  for (const doc of existingDocs) {
    if (doc.filePath && fs.existsSync(doc.filePath)) {
      fs.unlinkSync(doc.filePath);
      console.log(`Deleted file: ${doc.filePath}`);
    }
  }
  
  // Delete documents
  if (existingDocs.length > 0) {
    await db.collection('documents').deleteMany({ agent: { $in: agentIds } });
  }
  
  // Delete agents
  if (existingAgents.length > 0) {
    await db.collection('agents').deleteMany({ owner: { $in: userIds } });
  }
  
  // Delete users
  await db.collection('users').deleteMany({ walletAddress: TEST_WALLET_ADDRESS });
  
  console.log('✅ Successfully cleaned up existing test data');
}

// Main function
async function main() {
  console.log('==================================');
  console.log('Clippy Test Data Generator (Updated)');
  console.log('==================================\n');
  
  let client;
  try {
    // Connect to MongoDB
    console.log(`🔄 Connecting to database ${MONGODB_URI}...`);
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    console.log('✅ Database connection successful!');
    
    const db = client.db();
    
    // Clean up existing test data
    await cleanupExistingData(db);
    
    const usersCollection = db.collection('users');
    const agentsCollection = db.collection('agents');
    const documentsCollection = db.collection('documents');
    
    // Insert user data
    console.log('\n🔄 Creating test users...');
    const userResult = await usersCollection.insertMany(testUsers);
    console.log(`✅ Created ${userResult.insertedCount} test users`);
    
    // Reference to first user ID
    const userId = userResult.insertedIds[0];
    
    // Set owner property for Agents
    const agentsWithOwner = testAgents.map(agent => ({
      ...agent,
      owner: userId
    }));
    
    // Insert Agent data
    console.log('\n🔄 Creating test Agents...');
    const agentResult = await agentsCollection.insertMany(agentsWithOwner);
    console.log(`✅ Created ${agentResult.insertedCount} test Agents`);
    
    // Get Agent IDs
    const agentIds = Object.values(agentResult.insertedIds);
    
    // Generate Document data
    const testDocuments = generateTestDocuments(agentIds);
    
    // Insert Document data
    console.log('\n🔄 Creating test Documents...');
    const docResult = await documentsCollection.insertMany(testDocuments);
    console.log(`✅ Created ${docResult.insertedCount} test Documents`);
    
    // Print summary
    console.log('\n==================================');
    console.log('Test Data Generation Summary:');
    console.log('==================================');
    console.log(`👤 Users: ${userResult.insertedCount}`);
    console.log(`🤖 Agents: ${agentResult.insertedCount}`);
    console.log(`📄 Documents: ${docResult.insertedCount}`);
    console.log(`\n🔑 Test wallet address: ${TEST_WALLET_ADDRESS}`);
    console.log('\n✨ You can use this wallet address and generate a signature using sign-message.js to log in to the system');
    
    // Internal API test information
    console.log('\n==================================');
    console.log('Internal API Test Information:');
    console.log('==================================');
    console.log(`🔗 Get all Agents with file URLs: GET ${BASE_URL}/api/internal/agents`);
    
    // Print the first Agent's ID for rating test
    if (agentIds.length > 0) {
      console.log(`🔗 Agent rating test: POST ${BASE_URL}/api/internal/agents/${agentIds[0]}/rating`);
      console.log(`   Request body: { "score": 90, "feedback": "This is a test rating" }`);
    }
    
    // Print the first document's ID for file download test
    if (docResult.insertedIds && Object.keys(docResult.insertedIds).length > 0) {
      const firstDocId = docResult.insertedIds[0];
      console.log(`🔗 File download test: GET ${BASE_URL}/api/files/${firstDocId}/download`);
    }
    
  } catch (error) {
    console.error('❌ Error generating test data:', error);
  } finally {
    if (client) {
      await client.close();
      console.log('\n🔄 Database connection closed');
    }
  }
}

main(); 