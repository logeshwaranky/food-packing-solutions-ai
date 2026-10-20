import axios from 'axios';
import {
  FoodTypeSummary, FoodTypeDetail, FoodCategory, PackagingMethod,
  PackagingMaterial, PackagingOption, RecommendationResponse,
  ProtectionGuide, ComparisonResponse, AdminStats
} from '../types';

const getApiBase = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (!envUrl) return '/api';
  const trimmed = envUrl.trim().replace(/\/$/, '');
  const urlWithProtocol = (trimmed.startsWith('http://') || trimmed.startsWith('https://'))
    ? trimmed
    : `https://${trimmed}`;
  return `${urlWithProtocol}/api`;
};

const API_BASE = getApiBase();

const api = axios.create({
  baseURL: API_BASE,

  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('foodpack_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const foodService = {
  getCategories: async (): Promise<FoodCategory[]> => {
    const res = await api.get('/foods/categories');
    return res.data;
  },

  getFoods: async (params: {
    q?: string;
    category_id?: number;
    physical_state?: string;
    moisture_level?: string;
    oxygen_sensitivity?: string;
    spoilage_risk?: string;
    storage_temp?: string;
    page?: number;
    page_size?: number;
    sort_by?: string;
    sort_order?: string;
  }) => {
    const res = await api.get('/foods', { params });
    return res.data;
  },

  getFoodDetail: async (id: number): Promise<FoodTypeDetail> => {
    const res = await api.get(`/foods/${id}`);
    return res.data;
  },

  searchSuggestions: async (q: string) => {
    const res = await api.get('/foods/search', { params: { q } });
    return res.data;
  }
};

export const packagingService = {
  getMethods: async (category?: string): Promise<PackagingMethod[]> => {
    const res = await api.get('/packaging/methods', { params: { category } });
    return res.data;
  },

  getMethodDetail: async (id: number): Promise<PackagingMethod> => {
    const res = await api.get(`/packaging/methods/${id}`);
    return res.data;
  },

  getMaterials: async (): Promise<PackagingMaterial[]> => {
    const res = await api.get('/packaging/materials');
    return res.data;
  },

  getOptions: async (): Promise<PackagingOption[]> => {
    const res = await api.get('/packaging/options');
    return res.data;
  },

  compareOptions: async (optionIds: number[], foodId?: number): Promise<ComparisonResponse> => {
    const res = await api.post('/packaging/compare', {
      packaging_option_ids: optionIds,
      food_id: foodId
    });
    return res.data;
  }
};

export const recommendationService = {
  getRecommendations: async (data: {
    query?: string;
    food_name?: string;
    category_id?: number;
    quantity?: string;
    moisture_level?: string;
    fat_oil_content?: string;
    oxygen_sensitivity?: string;
    light_sensitivity?: string;
    aroma_sensitivity?: string;
    storage_temperature?: string;
    target_shelf_life?: string;
    budget?: string;
    sustainability_preference?: string;
  }): Promise<RecommendationResponse> => {
    const res = await api.post('/recommendations', data);
    return res.data;
  }
};

export const guideService = {
  getGuides: async (): Promise<ProtectionGuide[]> => {
    const res = await api.get('/protection-guides');
    return res.data;
  },

  getGuideById: async (id: string): Promise<ProtectionGuide> => {
    const res = await api.get(`/protection-guides/${id}`);
    return res.data;
  }
};

export const feedbackService = {
  submitFeedback: async (data: {
    recommendation_id?: number;
    rating: number;
    comments?: string;
    selected_packaging_id?: number;
    user_email?: string;
  }) => {
    const res = await api.post('/feedback', data);
    return res.data;
  }
};

export const adminService = {
  login: async (email: string, password: string) => {
    const res = await api.post('/auth/login', { email, password });
    return res.data;
  },

  getMe: async () => {
    const res = await api.get('/auth/me');
    return res.data;
  },

  getStats: async (): Promise<AdminStats> => {
    const res = await api.get('/admin/stats');
    return res.data;
  },

  createFood: async (data: any) => {
    const res = await api.post('/admin/foods', data);
    return res.data;
  },

  deleteFood: async (id: number) => {
    const res = await api.delete(`/admin/foods/${id}`);
    return res.data;
  },

  importDataset: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await api.post('/admin/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  }
};

export default api;
