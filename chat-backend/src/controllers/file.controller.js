const path = require('path');

class FileController {
  async uploadFile(req, res, next) {
    try {
      console.log('File upload request received');
      if (!req.file) {
        console.log('No file in request');
        return res.status(400).json({
          success: false,
          message: 'No file uploaded'
        });
      }

      console.log('File uploaded:', req.file.filename);
      const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

      res.status(201).json({
        success: true,
        message: 'File uploaded successfully',
        data: {
          url: fileUrl,
          name: req.file.originalname,
          size: req.file.size,
          mimetype: req.file.mimetype,
          filename: req.file.filename
        }
      });
    } catch (error) {
      console.error('File upload controller error:', error);
      next(error);
    }
  }

  async deleteFile(req, res, next) {
    // Basic implementation for now
    res.json({
      success: true,
      message: 'File deletion logic would go here'
    });
  }
}

module.exports = new FileController();
