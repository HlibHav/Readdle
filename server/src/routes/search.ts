import { Request, Response } from 'express';
import { typesenseService, SearchRequest } from '../services/typesenseService.js';

export async function unifiedSearch(req: Request, res: Response) {
  try {
    const { query, filters, limit, includeWeb } = req.body;

    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      return res.status(400).json({ 
        error: 'Search query is required and must be a non-empty string',
        success: false 
      });
    }

    const searchRequest: SearchRequest = {
      query: query.trim(),
      filters,
      limit: Math.min(limit || 20, 50), // Cap at 50 results
      includeWeb: includeWeb !== false // Default to true
    };

    console.log(`🔍 Processing search request: "${searchRequest.query}"`);

    const results = await typesenseService.unifiedSearch(searchRequest);

    res.json({
      success: true,
      ...results,
      query: searchRequest.query
    });

  } catch (error) {
    console.error('Search API error:', error);
    res.status(500).json({ 
      error: 'Search failed',
      success: false,
      documents: [],
      web: [],
      totalDocuments: 0,
      totalWeb: 0,
      processingTime: 0
    });
  }
}

export async function searchDocuments(req: Request, res: Response) {
  try {
    const { query, filters, limit } = req.body;

    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      return res.status(400).json({ 
        error: 'Search query is required and must be a non-empty string',
        success: false 
      });
    }

    const searchRequest: SearchRequest = {
      query: query.trim(),
      filters,
      limit: Math.min(limit || 20, 50)
    };

    const documents = await typesenseService.searchDocuments(searchRequest);

    res.json({
      success: true,
      documents,
      totalDocuments: documents.length,
      query: searchRequest.query
    });

  } catch (error) {
    console.error('Document search API error:', error);
    res.status(500).json({ 
      error: 'Document search failed',
      success: false,
      documents: [],
      totalDocuments: 0
    });
  }
}

export async function searchWeb(req: Request, res: Response) {
  try {
    const { query, limit } = req.body;

    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      return res.status(400).json({ 
        error: 'Search query is required and must be a non-empty string',
        success: false 
      });
    }

    const webResults = await typesenseService.searchWeb(query.trim(), Math.min(limit || 10, 20));

    res.json({
      success: true,
      web: webResults,
      totalWeb: webResults.length,
      query: query.trim()
    });

  } catch (error) {
    console.error('Web search API error:', error);
    res.status(500).json({ 
      error: 'Web search failed',
      success: false,
      web: [],
      totalWeb: 0
    });
  }
}

export async function getSearchStats(req: Request, res: Response) {
  try {
    const stats = await typesenseService.getCollectionStats();
    
    res.json({
      success: true,
      stats
    });

  } catch (error) {
    console.error('Search stats API error:', error);
    res.status(500).json({ 
      error: 'Failed to get search stats',
      success: false,
      stats: null
    });
  }
}

export async function indexDocument(req: Request, res: Response) {
  try {
    const { file } = req.body;

    if (!file || !file.id) {
      return res.status(400).json({ 
        error: 'File data is required',
        success: false 
      });
    }

    await typesenseService.indexDocument(file);

    res.json({
      success: true,
      message: `Document ${file.name} indexed successfully`
    });

  } catch (error) {
    console.error('Document indexing API error:', error);
    res.status(500).json({ 
      error: 'Failed to index document',
      success: false
    });
  }
}

export async function removeDocument(req: Request, res: Response) {
  try {
    const { documentId } = req.params;

    if (!documentId) {
      return res.status(400).json({ 
        error: 'Document ID is required',
        success: false 
      });
    }

    await typesenseService.removeDocument(documentId);

    res.json({
      success: true,
      message: `Document ${documentId} removed from search index`
    });

  } catch (error) {
    console.error('Document removal API error:', error);
    res.status(500).json({ 
      error: 'Failed to remove document from search index',
      success: false
    });
  }
}

export async function bulkIndexDocuments(req: Request, res: Response) {
  try {
    const { files } = req.body;

    if (!files || !Array.isArray(files) || files.length === 0) {
      return res.status(400).json({ 
        error: 'Files array is required',
        success: false 
      });
    }

    await typesenseService.bulkIndexDocuments(files);

    res.json({
      success: true,
      message: `${files.length} documents indexed successfully`
    });

  } catch (error) {
    console.error('Bulk indexing API error:', error);
    res.status(500).json({ 
      error: 'Failed to bulk index documents',
      success: false
    });
  }
}

export async function indexAllDocuments(req: Request, res: Response) {
  try {
    // This would typically get documents from the database or file system
    // For now, we'll use the seed data as an example
    const seedDocuments = [
      {
        id: 'seed-1',
        name: 'Q4_Financial_Report_2024.pdf',
        type: 'pdf',
        content: 'Q4 Financial Report 2024 - This document contains comprehensive financial data for the fourth quarter of 2024, including revenue, expenses, profit margins, and growth metrics.',
        folder: 'Documents',
        tags: ['financial', 'report', '2024'],
        addedDate: '2024-01-15T00:00:00.000Z',
        size: 2048576
      },
      {
        id: 'seed-2', 
        name: 'Team_Meeting_Notes_2024-01-15.txt',
        type: 'text',
        content: 'Team Meeting Notes - January 15, 2024\n\nAttendees: John, Sarah, Mike, Lisa\n\nAgenda:\n1. Q4 Review\n2. Q1 Planning\n3. Budget Discussion\n4. New Features\n\nKey Points:\n- Q4 targets exceeded by 15%\n- New product launch scheduled for March\n- Budget approved for additional hires\n- Customer feedback very positive\n\nAction Items:\n- John: Prepare Q1 roadmap\n- Sarah: Review budget allocation\n- Mike: Research new technologies\n- Lisa: Schedule customer interviews\n\nNext Meeting: January 22, 2024',
        folder: 'Documents',
        tags: ['meeting', 'notes', 'team'],
        addedDate: '2024-01-15T00:00:00.000Z',
        size: 2048
      },
      {
        id: 'seed-3',
        name: 'Invoice_Acme_Corp_2024-01-10.pdf', 
        type: 'pdf',
        content: 'Invoice for Acme Corporation - Invoice number 12345 dated January 10, 2024. This invoice contains billing information for services rendered to Acme Corp.',
        folder: 'Documents',
        tags: ['invoice', 'acme', '2024'],
        addedDate: '2024-01-10T00:00:00.000Z',
        size: 1024000
      },
      {
        id: 'seed-4',
        name: 'Screenshot_2024-01-12.png',
        type: 'image', 
        content: 'Screenshot taken on January 12, 2024 showing user interface elements and design components.',
        folder: 'Images',
        tags: ['screenshot', 'ui'],
        addedDate: '2024-01-12T00:00:00.000Z',
        size: 512000
      }
    ];

    await typesenseService.bulkIndexDocuments(seedDocuments);

    res.json({ 
      success: true, 
      message: `All ${seedDocuments.length} documents indexed successfully` 
    });
  } catch (error) {
    console.error('Error indexing all documents:', error);
    res.status(500).json({ 
      error: 'Failed to index all documents',
      success: false 
    });
  }
}

export async function indexLibraryFiles(req: Request, res: Response) {
  try {
    const { files } = req.body;

    if (!files || !Array.isArray(files)) {
      return res.status(400).json({ 
        error: 'Files array is required',
        success: false 
      });
    }

    console.log(`📚 Indexing ${files.length} library files...`);

    // Index each file individually to ensure proper content extraction
    const results = [];
    for (const file of files) {
      try {
        await typesenseService.indexDocument(file);
        results.push({ id: file.id, name: file.name, success: true });
      } catch (error) {
        console.error(`Failed to index file ${file.name}:`, error);
        results.push({ id: file.id, name: file.name, success: false, error: error instanceof Error ? error.message : 'Unknown error' });
      }
    }

    const successCount = results.filter(r => r.success).length;
    const failCount = results.filter(r => !r.success).length;

    res.json({ 
      success: true, 
      message: `Indexed ${successCount} files successfully${failCount > 0 ? `, ${failCount} failed` : ''}`,
      results,
      stats: {
        total: files.length,
        successful: successCount,
        failed: failCount
      }
    });
  } catch (error) {
    console.error('Error indexing library files:', error);
    res.status(500).json({ 
      error: 'Failed to index library files',
      success: false 
    });
  }
}

export async function getDocumentFilters(req: Request, res: Response) {
  try {
    // Get available filters from the collection
    const client = typesenseService.getClient();
    const collectionName = typesenseService.getCollectionName();
    const collection = await client.collections(collectionName).retrieve();
    
    // Get facet counts for available filters
    const facetSearch = await client.collections(collectionName).documents().search({
      q: '*',
      per_page: 0,
      facet_by: 'type,folder,fileExtension,isImage,isDocument',
      max_facet_values: 50
    });

    const filters = {
      documentTypes: facetSearch.facet_counts?.find(f => f.field_name === 'type')?.counts || [],
      folders: facetSearch.facet_counts?.find(f => f.field_name === 'folder')?.counts || [],
      fileExtensions: facetSearch.facet_counts?.find(f => f.field_name === 'fileExtension')?.counts || [],
      contentTypes: {
        images: facetSearch.facet_counts?.find(f => f.field_name === 'isImage')?.counts?.find(c => c.value === 'true')?.count || 0,
        documents: facetSearch.facet_counts?.find(f => f.field_name === 'isDocument')?.counts?.find(c => c.value === 'true')?.count || 0
      }
    };

    res.json({
      success: true,
      filters
    });
  } catch (error) {
    console.error('Error getting document filters:', error);
    res.status(500).json({
      error: 'Failed to get document filters',
      success: false,
      filters: {}
    });
  }
}
