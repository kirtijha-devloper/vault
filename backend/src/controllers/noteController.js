const prisma = require('../config/db');
const { encrypt, decrypt } = require('../utils/encryption');

// @desc    Get all notes for logged in user
// @route   GET /api/vault/notes
// @access  Private
const getNotes = async (req, res) => {
  try {
    const notes = await prisma.noteItem.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
    });

    const decryptedNotes = notes.map((item) => ({
      ...item,
      content: decrypt(item.content),
    }));

    res.json(decryptedNotes);
  } catch (error) {
    console.error('Get notes error:', error);
    res.status(500).json({ error: 'Server error while fetching notes' });
  }
};

// @desc    Create a new note item
// @route   POST /api/vault/notes
// @access  Private
const createNote = async (req, res) => {
  const { title, content, category, color } = req.body;

  if (!title || !content) {
    return res.status(400).json({ error: 'Title and content are required' });
  }

  try {
    const encryptedContent = encrypt(content);

    const newNote = await prisma.noteItem.create({
      data: {
        title,
        content: encryptedContent,
        category: category || 'Notes',
        color: color || '#3B82F6',
        userId: req.user.id,
      },
    });

    res.status(201).json({
      ...newNote,
      content: decrypt(newNote.content),
    });
  } catch (error) {
    console.error('Create note error:', error);
    res.status(500).json({ error: 'Server error while creating note' });
  }
};

// @desc    Update a note item
// @route   PUT /api/vault/notes/:id
// @access  Private
const updateNote = async (req, res) => {
  const { id } = req.params;
  const { title, content, category, color } = req.body;

  try {
    const existingNote = await prisma.noteItem.findUnique({ where: { id } });
    if (!existingNote || existingNote.userId !== req.user.id) {
      return res.status(404).json({ error: 'Note not found or unauthorized' });
    }

    const updatedData = {};
    if (title) updatedData.title = title;
    if (content) updatedData.content = encrypt(content);
    if (category) updatedData.category = category;
    if (color) updatedData.color = color;

    const updatedNote = await prisma.noteItem.update({
      where: { id },
      data: updatedData,
    });

    res.json({
      ...updatedNote,
      content: decrypt(updatedNote.content),
    });
  } catch (error) {
    console.error('Update note error:', error);
    res.status(500).json({ error: 'Server error while updating note' });
  }
};

// @desc    Delete a note item
// @route   DELETE /api/vault/notes/:id
// @access  Private
const deleteNote = async (req, res) => {
  const { id } = req.params;

  try {
    const existingNote = await prisma.noteItem.findUnique({ where: { id } });
    if (!existingNote || existingNote.userId !== req.user.id) {
      return res.status(404).json({ error: 'Note not found or unauthorized' });
    }

    await prisma.noteItem.delete({ where: { id } });

    res.json({ message: 'Note deleted successfully', id });
  } catch (error) {
    console.error('Delete note error:', error);
    res.status(500).json({ error: 'Server error while deleting note' });
  }
};

module.exports = {
  getNotes,
  createNote,
  updateNote,
  deleteNote,
};
