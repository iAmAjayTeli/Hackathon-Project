export interface AppUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  role?: 'admin' | 'supervisor' | 'agent';
  permissions?: string[];
} 