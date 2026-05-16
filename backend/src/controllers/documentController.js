const prisma = require('../config/db');
const cloudinary = require('cloudinary').v2;
const path = require('path');
const fs = require('fs');

// @desc    Get all documents for logged in user
// @route   GET /api/vault/documents
// @access  Private
const getDocuments = async (req, res) => {
  try {
    const documents = await prisma.documentItem.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
    });
    res.json(documents);
  } catch (error) {
    console.error('Get documents error:', error);
    res.status(500).json({ error: 'Server error while fetching documents' });
  }
};

// @desc    Upload a new document
// @route   POST /api/vault/documents
// @access  Private
const uploadDocument = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Please upload a file' });
  }

  const { title, category, description } = req.body;

  if (!title) {
    return res.status(400).json({ error: 'Document title is required' });
  }

  try {
    let fileUrl = req.file.path;
    let fileId = req.file.filename;

    // If Cloudinary was used, req.file.path is the URL and req.file.filename is the public_id
    if (req.file.path.startsWith('http')) {
      fileUrl = req.file.path;
      fileId = req.file.filename;
    } else {
      // Local disk storage fallback formatting
      fileUrl = `/uploads/${req.file.filename}`;
    }

    const newDoc = await prisma.documentItem.create({
      data: {
        title,
        category: category || 'Documents',
        description: description || '',
        fileUrl,
        fileId,
        fileSize: req.file.size || 0,
        fileType: req.file.mimetype || 'application/octet-stream',
        userId: req.user.id,
      },
    });

    res.status(201).json(newDoc);
  } catch (error) {
    console.error('Upload document error:', error);
    res.status(500).json({ error: 'Server error while uploading document' });
  }
};

// @desc    Delete a document
// @route   DELETE /api/vault/documents/:id
// @access  Private
const deleteDocument = async (req, res) => {
  const { id } = req.params;

  try {
    const existingDoc = await prisma.documentItem.findUnique({ where: { id } });
    if (!existingDoc || existingDoc.userId !== req.user.id) {
      return res.status(404).json({ error: 'Document not found or unauthorized' });
    }

    // Remove file from storage
    if (existingDoc.fileUrl.startsWith('http')) {
      // Cloudinary deletion
      try {
        await cloudinary.uploader.destroy(existingDoc.fileId);
      } catch (cloudErr) {
        console.error('Cloudinary destroy error:', cloudErr);
      }
    } else {
      // Local disk deletion
      const filePath = path.join(__dirname, '../../uploads', existingDoc.fileId);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await prisma.documentItem.delete({ where: { id } });

    res.json({ message: 'Document deleted successfully', id });
  } catch (error) {
    console.error('Delete document error:', error);
    res.status(500).json({ error: 'Server error while deleting document' });
  }
};

module.exports = {
  getDocuments,
  uploadDocument,
  deleteDocument,
};
