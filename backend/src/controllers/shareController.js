const crypto = require('crypto');
const bcrypt = require('bcrypt');
const prisma = require('../config/db');
const { decrypt } = require('../utils/encryption');

// @desc    Create a secure share link
// @route   POST /api/share/create
// @access  Private
const createShare = async (req, res) => {
  const { itemId, itemType, expiresInHours, password } = req.body;

  if (!itemId || !itemType) {
    return res.status(400).json({ error: 'Item ID and Item Type are required' });
  }

  try {
    // Verify item ownership
    let item;
    if (itemType === 'PASSWORD') {
      item = await prisma.passwordItem.findUnique({ where: { id: itemId } });
    } else if (itemType === 'DOCUMENT') {
      item = await prisma.documentItem.findUnique({ where: { id: itemId } });
    } else if (itemType === 'NOTE') {
      item = await prisma.noteItem.findUnique({ where: { id: itemId } });
    }

    if (!item || item.userId !== req.user.id) {
      return res.status(404).json({ error: 'Item not found or unauthorized' });
    }

    // Calculate expiry
    const hours = expiresInHours ? parseInt(expiresInHours) : 24; // Default 24 hours
    const expiresAt = new Date(Date.now() + hours * 60 * 60 * 1000);

    // Handle optional password protection
    let isPasswordProtected = false;
    let passwordHash = null;

    if (password && password.trim() !== '') {
      isPasswordProtected = true;
      const salt = await bcrypt.genSalt(10);
      passwordHash = await bcrypt.hash(password, salt);
    }

    // Generate unique token
    const token = crypto.randomBytes(16).toString('hex');

    const shareLink = await prisma.shareLink.create({
      data: {
        token,
        itemId,
        itemType,
        expiresAt,
        isPasswordProtected,
        passwordHash,
        userId: req.user.id,
      },
    });

    res.status(201).json({
      id: shareLink.id,
      token: shareLink.token,
      expiresAt: shareLink.expiresAt,
      isPasswordProtected: shareLink.isPasswordProtected,
      shareUrl: `${req.protocol}://${req.get('host')}/share/${shareLink.token}`, // Client route
    });
  } catch (error) {
    console.error('Create share error:', error);
    res.status(500).json({ error: 'Server error while creating share link' });
  }
};

// @desc    Get shared item (Public access with token)
// @route   POST /api/share/:token
// @access  Public
const getSharedItem = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body; // Password provided by visitor if protected

  try {
    const shareLink = await prisma.shareLink.findUnique({ where: { token } });

    if (!shareLink) {
      return res.status(404).json({ error: 'Share link not found or has been revoked' });
    }

    // Check expiry
    if (new Date() > new Date(shareLink.expiresAt)) {
      // Auto delete expired share link
      await prisma.shareLink.delete({ where: { id: shareLink.id } });
      return res.status(410).json({ error: 'This share link has expired' });
    }

    // Check password protection
    if (shareLink.isPasswordProtected) {
      if (!password) {
        return res.status(401).json({ isPasswordProtected: true, error: 'Password required to access this item' });
      }

      const isMatch = await bcrypt.compare(password, shareLink.passwordHash);
      if (!isMatch) {
        return res.status(401).json({ isPasswordProtected: true, error: 'Incorrect password' });
      }
    }

    // Fetch underlying item
    let itemData;
    if (shareLink.itemType === 'PASSWORD') {
      const item = await prisma.passwordItem.findUnique({ where: { id: shareLink.itemId } });
      if (!item) return res.status(404).json({ error: 'Original item no longer exists' });

      itemData = {
        type: 'PASSWORD',
        title: item.title,
        website: item.website,
        username: item.username,
        password: decrypt(item.password),
        notes: item.notes ? decrypt(item.notes) : '',
        category: item.category,
      };
    } else if (shareLink.itemType === 'DOCUMENT') {
      const item = await prisma.documentItem.findUnique({ where: { id: shareLink.itemId } });
      if (!item) return res.status(404).json({ error: 'Original item no longer exists' });

      itemData = {
        type: 'DOCUMENT',
        title: item.title,
        category: item.category,
        description: item.description,
        fileUrl: item.fileUrl,
        fileSize: item.fileSize,
        fileType: item.fileType,
      };
    } else if (shareLink.itemType === 'NOTE') {
      const item = await prisma.noteItem.findUnique({ where: { id: shareLink.itemId } });
      if (!item) return res.status(404).json({ error: 'Original item no longer exists' });

      itemData = {
        type: 'NOTE',
        title: item.title,
        content: decrypt(item.content),
        category: item.category,
        color: item.color,
      };
    }

    // Increment views
    await prisma.shareLink.update({
      where: { id: shareLink.id },
      data: { views: { increment: 1 } },
    });

    res.json(itemData);
  } catch (error) {
    console.error('Get shared item error:', error);
    res.status(500).json({ error: 'Server error while fetching shared item' });
  }
};

// @desc    Get all active share links for logged in user
// @route   GET /api/share
// @access  Private
const getMyShares = async (req, res) => {
  try {
    // Clean up expired links first
    await prisma.shareLink.deleteMany({
      where: {
        userId: req.user.id,
        expiresAt: { lt: new Date() },
      },
    });

    const shares = await prisma.shareLink.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
    });

    res.json(shares);
  } catch (error) {
    console.error('Get my shares error:', error);
    res.status(500).json({ error: 'Server error while fetching share links' });
  }
};

// @desc    Revoke a share link
// @route   DELETE /api/share/revoke/:id
// @access  Private
const revokeShare = async (req, res) => {
  const { id } = req.params;

  try {
    const share = await prisma.shareLink.findUnique({ where: { id } });
    if (!share || share.userId !== req.user.id) {
      return res.status(404).json({ error: 'Share link not found or unauthorized' });
    }

    await prisma.shareLink.delete({ where: { id } });

    res.json({ message: 'Share link revoked successfully', id });
  } catch (error) {
    console.error('Revoke share error:', error);
    res.status(500).json({ error: 'Server error while revoking share link' });
  }
};

module.exports = {
  createShare,
  getSharedItem,
  getMyShares,
  revokeShare,
};
