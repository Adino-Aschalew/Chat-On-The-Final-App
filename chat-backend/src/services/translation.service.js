const translate = require('google-translate-api-x');
const { logger } = require('../middleware/error.middleware');

class TranslationService {
  /**
   * Translate text to a target language
   */
  async translateText(text, targetLang) {
    try {
      if (!text || !targetLang) {
        throw new Error('Text and target language are required');
      }

      const res = await translate(text, { to: targetLang });
      
      return {
        originalText: text,
        translatedText: res.text,
        from: res.from.language.iso,
        to: targetLang
      };
    } catch (error) {
      logger.error('Translation error:', error);
      throw new Error('Failed to translate text');
    }
  }
}

module.exports = new TranslationService();
