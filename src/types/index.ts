export interface ServiceMetadata {
  name: string;
  description: string;
  port: number;
  domain?: string;
  type: 'website' | 'api' | 'game';
  publicUrl: string;
}

export interface RegisteredService extends ServiceMetadata {
  id: string; // Unique identifier for the registration
  token: string; // Generated token
  localUrl: string;
  createdAt: string;
}
