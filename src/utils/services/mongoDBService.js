const API_BASE_URL = "http://localhost:5000/api";

class MongoDBService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  async makeRequest(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`API Error for ${endpoint}:`, error);
      throw error;
    }
  }

  async healthCheck() {
    try {
      const response = await this.makeRequest("/health");
      return response;
    } catch (error) {
      return {
        status: "ERROR",
        message: "Backend connection failed",
        error: error.message
      };
    }
  }

  async getTestProblems(count = 5, difficulty = null, sessionId = null) {
    try {
      let endpoint = `/intelligent/generate-test?count=${count}`;
      if (difficulty) endpoint += `&difficulty=${difficulty}`;
      if (sessionId) endpoint += `&sessionId=${sessionId}`;

      const response = await this.makeRequest(endpoint);
      return {
        success: response.success || true,
        data: response.data || [],
        total: response.count || 0,
        source: "Backend"
      };
    } catch (error) {
      return {
        success: false,
        data: [],
        total: 0,
        error: error.message
      };
    }
  }

  async getAllProblems() {
    try {
      const response = await this.makeRequest("/problems");
      return {
        success: true,
        data: response.data || [],
        total: response.count || 0,
        source: "Backend"
      };
    } catch (error) {
      return {
        success: false,
        data: [],
        total: 0,
        error: error.message
      };
    }
  }

  // Add other methods as needed...
}

const mongoDBService = new MongoDBService();
export default mongoDBService;