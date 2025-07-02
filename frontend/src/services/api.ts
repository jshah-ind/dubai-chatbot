import axios from 'axios';

// API Configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Types
export interface ChatMessage {
  message: string;
}

export interface ChatResponse {
  response: string;
  crime_data?: any;
  sources?: string[];
}

export interface SearchRequest {
  time_period: string;
  geographic_focus: string;
  crime_types: string[];
  severity_level: string;
  max_results: number;
}

export interface CrimeCase {
  crime_id: string;
  crime_type: string;
  country: string;
  city?: string;
  continent: string;
  date_occurred: string;
  date_reported: string;
  agencies_involved: Array<{
    agency_name: string;
    agency_type: string;
    role: string;
  }>;
  current_status: string;
  case_details: {
    brief_description: string;
    severity_level: string;
    victims_count?: string;
    suspects_count?: string;
  };
}

export interface HealthStatus {
  status: string;
  timestamp: string;
  api_status: string;
}

// API Functions
export const chatAPI = {
  sendMessage: async (message: string): Promise<ChatResponse> => {
    const response = await api.post<ChatResponse>('/chat', { message });
    return response.data;
  },
};

export const searchAPI = {
  searchCrimes: async (searchParams: SearchRequest): Promise<CrimeCase[]> => {
    const response = await api.post<CrimeCase[]>('/search/crimes', searchParams);
    return response.data;
  },
};

export const healthAPI = {
  checkHealth: async (): Promise<HealthStatus> => {
    const response = await api.get<HealthStatus>('/health');
    return response.data;
  },
};

// Error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    
    if (error.response) {
      // Server responded with error status
      throw new Error(`API Error: ${error.response.status} - ${error.response.data?.detail || error.response.statusText}`);
    } else if (error.request) {
      // Request was made but no response received
      throw new Error('Network Error: Unable to connect to the server. Please check if the API is running.');
    } else {
      // Something else happened
      throw new Error(`Request Error: ${error.message}`);
    }
  }
);

export default api;
