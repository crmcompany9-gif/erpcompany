const express = require('express');
const router = express.Router();
const { upload, cloudinary } = require('../config/cloudinary');
const Client = require('../models/Client');

// POST — Upload file/image for a client update
router.post('/client/:clientId', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const { clientId } = req.params;
    const { note, department, updatedByName, updatedBy } = req.body;

    // File details from Cloudinary
    const fileUrl = req.file.path;
    const fileName = req.file.originalname;
    const fileType = req.file.mimetype;
    const publicId = req.file.filename;

    // Add to client documents
    const client = await Client.findById(clientId);
    if (!client) return res.status(404).json({ message: 'Client not found' });

    // Add document record
    client.documents.push({
      name: fileName,
      type: fileType.includes('pdf') ? 'PDF' :
            fileType.includes('image') ? 'Image' : 'Document',
      url: fileUrl,
      publicId,
      uploadedByName: updatedByName,
      uploadedBy: updatedBy,
      uploadedAt: new Date(),
    });

    // Also add as an update with file attached
    if (note) {
      client.updates.push({
        updatedBy,
        updatedByName,
        department,
        note,
        fileUrl,
        fileName,
        createdAt: new Date(),
      });
    }

    await client.save();

    res.json({
      message: '✅ File uploaded successfully',
      file: {
        url: fileUrl,
        name: fileName,
        type: fileType,
      },
    });

  } catch (err) {
  console.error('Upload error message:', err.message);
  console.error('Upload error stack:', err.stack);
  console.error('Upload error full:', JSON.stringify(err, null, 2));
  res.status(500).json({ message: 'Upload failed', error: err.message });
}
});

// DELETE — Remove a file from Cloudinary
router.delete('/file/:publicId', async (req, res) => {
  try {
    await cloudinary.uploader.destroy(req.params.publicId);
    res.json({ message: '✅ File deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Delete failed', error: err.message });
  }
});

module.exports = router;