export interface ExternalBook {
  title: string;
  author: string;
  description?: string;
  coverUrl?: string;
  publishedDate?: string;
  isbn?: string;
  isAvailable?: boolean;
  availability?: string;
}
