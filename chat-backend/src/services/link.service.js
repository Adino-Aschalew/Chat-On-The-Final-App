const axios = require('axios');
const { logger } = require('../middleware/error.middleware');

class LinkService {
  async getLinkMetadata(url) {
    try {
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        },
        timeout: 5000
      });

      const html = response.data;
      const metadata = {
        title: this.extractMeta(html, 'og:title') || this.extractTitle(html),
        description: this.extractMeta(html, 'og:description') || this.extractMeta(html, 'description'),
        image: this.extractMeta(html, 'og:image'),
        url: url,
        siteName: this.extractMeta(html, 'og:site_name')
      };

      return metadata;
    } catch (error) {
      logger.error('Link preview error:', error.message);
      return { url };
    }
  }

  extractMeta(html, property) {
    const regex = new RegExp(`<meta[^>]+(?:property|name)="${property}"[^>]+content="([^"]+)"`, 'i');
    const match = html.match(regex);
    if (match) return match[1];
    
    // Try reversed order
    const regex2 = new RegExp(`<meta[^>]+content="([^"]+)"[^>]+(?:property|name)="${property}"`, 'i');
    const match2 = html.match(regex2);
    return match2 ? match2[1] : null;
  }

  extractTitle(html) {
    const match = html.match(/<title>([^<]+)<\/title>/i);
    return match ? match[1] : null;
  }
}

module.exports = new LinkService();
