import api from './api';

const aiService = {
  /**
   * Send a chat message to the AI assistant.
   * @param {string} message
   * @param {'EN'|'HI'} language
   */
  ask: (message, language = 'EN') =>
    api.post('/ask', { message, language }),

  /**
   * Send an image for plant disease prediction.
   * @param {File} imageFile
   */
  predict: (imageFile) => {
    const formData = new FormData();
    formData.append('image', imageFile);
    return api.post('/predict', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 15000, // image analysis can take longer
    });
  },
};

export default aiService;
