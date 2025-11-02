/**
 * ISL Recognition API Service
 * Communicates with the Flask ML prediction server
 */

/**
 * ISL Recognition API Service
 * Communicates with the Flask ML API for predictions
 */

// Use environment variable for API URL, fallback to localhost for dev
const API_BASE_URL = import.meta.env.VITE_ML_API_URL || 'http://localhost:5000/api'
const TIMEOUT = 2000 // 2 second timeout

export const islApi = {
  /**
   * Make a prediction from hand angle features
   * @param {Object} features - 17 hand angle features
   * @returns {Promise<Object>} Prediction result with sign and confidence
   */
  async predict(features) {
    try {
      const response = await fetch(`${API_URL}/api/predict`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ features })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      return {
        success: true,
        ...data
      };
    } catch (error) {
      console.error('ISL API Error:', error);
      return {
        success: false,
        error: error.message,
        predicted_sign: null,
        confidence: 0
      };
    }
  },

  /**
   * Get all available ISL labels
   * @returns {Promise<Object>} List of signs
   */
  async getLabels() {
    try {
      const response = await fetch(`${API_URL}/api/labels`);
      if (!response.ok) throw new Error('Failed to fetch labels');
      return await response.json();
    } catch (error) {
      console.error('Failed to get labels:', error);
      return { labels: [], num_classes: 0 };
    }
  },

  /**
   * Get required feature names
   * @returns {Promise<Object>} Feature information
   */
  async getFeatures() {
    try {
      const response = await fetch(`${API_URL}/api/features`);
      if (!response.ok) throw new Error('Failed to fetch features');
      return await response.json();
    } catch (error) {
      console.error('Failed to get features:', error);
      return { features: [], num_features: 0 };
    }
  },

  /**
   * Check if the API server is running
   * @returns {Promise<Object>} Health status
   */
  async healthCheck() {
    try {
      const response = await fetch(`${API_URL}/health`, {
        method: 'GET',
        signal: AbortSignal.timeout(2000) // 2 second timeout
      });
      
      if (!response.ok) throw new Error('API unhealthy');
      
      const data = await response.json();
      return {
        online: true,
        ...data
      };
    } catch (error) {
      console.warn('ISL API offline:', error.message);
      return {
        online: false,
        status: 'offline',
        error: error.message
      };
    }
  }
};

export default islApi;
