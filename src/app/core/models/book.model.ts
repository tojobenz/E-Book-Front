export interface Book {
  id: number;
  title: string;
  author: string;
  description?: string;
  coverUrl?: string;
  publishedDate?: string;
  isbn?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBook {
  title: string;
  author: string;
  description?: string;
  coverUrl?: string;
  publishedDate?: string;
  isbn?: string;
}

export interface UpdateBook {
  title: string;
  author: string;
  description?: string;
  coverUrl?: string;
  publishedDate?: string;
  isbn?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
}

export interface BookPaginatedResponse extends PaginatedResponse<Book> {}

export interface ApiError {
  status: number;
  message: string;
  details?: string;
}
