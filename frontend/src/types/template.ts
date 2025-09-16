export interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  author: string;
  version: string;
  downloads: number;
  rating: number;
  createdAt: string;
  updatedAt: string;
  workflow: {
    nodes: any[];
    connections: any[];
  };
  preview?: string;
  documentation?: string;
  requirements?: string[];
}

export interface Category {
  id: string;
  name: string;
  description: string;
  icon: string;
  templateCount: number;
}

export interface SearchFilters {
  category?: string;
  tags?: string[];
  minRating?: number;
  sortBy?: 'newest' | 'popular' | 'rating' | 'name';
  sortOrder?: 'asc' | 'desc';
}
