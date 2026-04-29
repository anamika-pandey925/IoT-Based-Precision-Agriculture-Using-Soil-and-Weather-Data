import api from './api';

const detectionService = {
  /**
   * Poll the animal/bird detection endpoint.
   * Expected response: { detected: boolean, threat?: string, message?: string, zone?: string }
   */
  check: () => api.get('/api/detect'),
};

export default detectionService;
