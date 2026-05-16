const prisma = require('../config/db');
const { encrypt, decrypt } = require('../utils/encryption');

// @desc    Get all passwords for logged in user
// @route   GET /api/vault/passwords
// @access  Private
const getPasswords = async (req, res) => {
  try {
    const passwords = await prisma.passwordItem.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
    });

    // Decrypt sensitive fields before sending to client
    const decryptedPasswords = passwords.map((item) => ({
      ...item,
      password: decrypt(item.password),
      notes: item.notes ? decrypt(item.notes) : '',
    }));

    res.json(decryptedPasswords);
  } catch (error) {
    console.error('Get passwords error:', error);
    res.status(500).json({ error: 'Server error while fetching passwords' });
  }
};

// @desc    Create a new password item
// @route   POST /api/vault/passwords
// @access  Private
const createPassword = async (req, res) => {
  const { title, website, username, password, notes, category } = req.body;

  if (!title || !username || !password) {
    return res.status(400).json({ error: 'Title, username, and password are required' });
  }

  try {
    // Encrypt sensitive fields
    const encryptedPassword = encrypt(password);
    const encryptedNotes = notes ? encrypt(notes) : null;

    const newItem = await prisma.passwordItem.create({
      data: {
        title,
        website: website || '',
        username,
        password: encryptedPassword,
        notes: encryptedNotes,
        category: category || 'Passwords',
        userId: req.user.id,
      },
    });

    // Return decrypted version to caller for immediate UI display
    res.status(201).json({
      ...newItem,
      password: decrypt(newItem.password),
      notes: newItem.notes ? decrypt(newItem.notes) : '',
    });
  } catch (error) {
    console.error('Create password error:', error);
    res.status(500).json({ error: 'Server error while creating password item' });
  }
};

// @desc    Update a password item
// @route   PUT /api/vault/passwords/:id
// @access  Private
const updatePassword = async (req, res) => {
  const { id } = req.params;
  const { title, website, username, password, notes, category } = req.body;

  try {
    // Check ownership
    const existingItem = await prisma.passwordItem.findUnique({ where: { id } });
    if (!existingItem || existingItem.userId !== req.user.id) {
      return res.status(404).json({ error: 'Password item not found or unauthorized' });
    }

    const updatedData = {};
    if (title) updatedData.title = title;
    if (website !== undefined) updatedData.website = website;
    if (username) updatedData.username = username;
    if (password) updatedData.password = encrypt(password);
    if (notes !== undefined) updatedData.notes = notes ? encrypt(notes) : null;
    if (category) updatedData.category = category;

    const updatedItem = await prisma.passwordItem.update({
      where: { id },
      data: updatedData,
    });

    res.json({
      ...updatedItem,
      password: decrypt(updatedItem.password),
      notes: updatedItem.notes ? decrypt(updatedItem.notes) : '',
    });
  } catch (error) {
    console.error('Update password error:', error);
    res.status(500).json({ error: 'Server error while updating password item' });
  }
};

// @desc    Delete a password item
// @route   DELETE /api/vault/passwords/:id
// @access  Private
const deletePassword = async (req, res) => {
  const { id } = req.params;

  try {
    const existingItem = await prisma.passwordItem.findUnique({ where: { id } });
    if (!existingItem || existingItem.userId !== req.user.id) {
      return res.status(404).json({ error: 'Password item not found or unauthorized' });
    }

    await prisma.passwordItem.delete({ where: { id } });

    res.json({ message: 'Password item deleted successfully', id });
  } catch (error) {
    console.error('Delete password error:', error);
    res.status(500).json({ error: 'Server error while deleting password item' });
  }
};

module.exports = {
  getPasswords,
  createPassword,
  updatePassword,
  deletePassword,
};
