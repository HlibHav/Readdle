#!/usr/bin/env node

/**
 * Script to index all library files for search
 * This ensures all files in the library are properly indexed in Typesense
 */

const fetch = require('node-fetch');

const API_BASE = 'http://localhost:5174/api';

async function indexAllFiles() {
  try {
    console.log('🔍 Starting library file indexing...');
    
    // First, let's get the current document count
    const statsResponse = await fetch(`${API_BASE}/search/stats`);
    const stats = await statsResponse.json();
    console.log('📊 Current index stats:', stats);
    
    // Index the seed documents
    console.log('📚 Indexing seed documents...');
    const seedResponse = await fetch(`${API_BASE}/search/index-all`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    const seedResult = await seedResponse.json();
    console.log('✅ Seed documents result:', seedResult);
    
    // Get final stats
    const finalStatsResponse = await fetch(`${API_BASE}/search/stats`);
    const finalStats = await finalStatsResponse.json();
    console.log('📊 Final index stats:', finalStats);
    
    console.log('🎉 Library indexing completed successfully!');
    
  } catch (error) {
    console.error('❌ Error indexing library files:', error);
    process.exit(1);
  }
}

// Run the indexing
indexAllFiles();

