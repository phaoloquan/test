
export type StoveCategory = 'Tất cả' | 'Bếp Củi' | 'Bếp Hiện Đại' | 'Lò Nướng' | 'Bếp Truyền Thống';

export interface Project {
  id: string;
  title: string;
  category: StoveCategory;
  description: string;
  imageUrl: string;
  date: string;
  location: string;
}

export interface Feedback {
  timestamp: string;
  name: string;
  phone: string;
  message: string;
}

export interface SiteInfo {
  phone: string;
  email: string;
  address: string;
  facebook?: string;
}
