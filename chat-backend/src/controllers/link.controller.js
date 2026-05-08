const linkService = require('../services/link.service');

class LinkController {
  async getPreview(req, res, next) {
    try {
      const { url } = req.query;
      if (!url) {
        return res.status(400).json({ success: false, message: 'URL is required' });
      }

      const metadata = await linkService.getLinkMetadata(url);
      res.json({
        success: true,
        data: metadata
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new LinkController();
