export interface Post {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  image?: string;
  date: string;
  author?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PostCreate {
  title: string;
  content: string;
  excerpt: string;
  image?: string;
  author?: string;
}