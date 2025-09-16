export interface Category {
  id: string;
  name: string;
  description?: string;
  color?: string;
  postCount: number;
}

export interface Tag {
  id: string;
  name: string;
  count: number;
}

export interface CategoryInfo {
  frontend: string;
  backend: string;
  deployment: string;
  design: string;
  career: string;
  trends: string;
  devops: string;
}

export const CATEGORIES: CategoryInfo = {
  frontend: '프론트엔드',
  backend: '백엔드',
  deployment: '배포',
  design: '디자인',
  career: '커리어',
  trends: '트렌드',
  devops: '데브옵스',
}

export const CATEGORY_COLORS: Record<string, string> = {
  frontend: '#3B82F6', // blue
  backend: '#10B981',  // emerald
  deployment: '#F59E0B', // amber
  design: '#EC4899',   // pink
  career: '#6366F1',   // indigo
  trends: '#EF4444',   // red
  devops: '#8B5CF6',   // violet
}

export interface ContentStats {
  totalPosts: number;
  categories: Category[];
  tags: Tag[];
  recentPosts: number;
}