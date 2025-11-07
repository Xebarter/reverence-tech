// supabase.ts
import { createClient } from '@supabase/supabase-js';

// Validate that environment variables are set
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  console.error('VITE_SUPABASE_URL is not set. Please add it to your .env file.');
  throw new Error('VITE_SUPABASE_URL is not set');
}

if (!supabaseAnonKey) {
  console.error('VITE_SUPABASE_ANON_KEY is not set. Please add it to your .env file.');
  throw new Error('VITE_SUPABASE_ANON_KEY is not set');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Service {
  id: string;
  package_name: string;
  description: string;
  key_features: string[];
  target_audience: string[];
  suggested_pricing: string;
  display_order: number;
  created_at: string;
}

export interface Inquiry {
  id: string;
  full_name: string;
  company_name: string;
  email: string;
  phone_number: string;
  interested_package: string;
  message: string;
  created_at: string;
}

export interface HeroImage {
  id: string;
  image_url: string;
  alt_text: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
}

export interface Testimonial {
  id: string;
  author_name: string;
  author_title: string;
  company: string;
  content: string;
  avatar_url: string;
  rating: number;
  is_featured: boolean;
  created_at: string;
}

export interface Job {
  id: string;
  title: string;
  description: string;
  requirements: string[];
  is_remote: boolean;
  job_type: 'Full-time' | 'Part-time' | 'Contract';
  location: string;
  salary_range?: string;
  is_active: boolean;
  created_at: string;
}

export interface JobApplication {
  id: string;
  job_id: string;
  full_name: string;
  email: string;
  phone: string;
  cover_letter: string;
  resume_url: string;
  created_at: string;
}

export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  created_at: string;
}

export interface BlogTag {
  id: string;
  name: string;
  slug: string;
  created_at: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featured_image_url: string;
  author: string;
  published_at: string;
  is_published: boolean;
  meta_description: string;
  meta_title: string;
  category_id: string;
  created_at: string;
  updated_at: string;
}

export interface BlogPostsTags {
  blog_post_id: string;
  tag_id: string;
}