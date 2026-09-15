export interface Member {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  status: 'pending' | 'active' | 'inactive';
  role: 'member' | 'admin';
  createdAt: Date;
  updatedAt: Date;
}

export interface MemberCreate {
  name: string;
  email: string;
  phone?: string;
  address?: string;
}