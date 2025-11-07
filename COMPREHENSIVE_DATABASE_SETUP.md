# Comprehensive Database Setup for Reverence Technology

This document explains the complete database schema and setup for the Reverence Technology application. This SQL script creates all necessary tables, relationships, storage buckets, and functions for the entire application.

## Database Schema Overview

### Tables

1. **services** - Service packages offered by the company
2. **inquiries** - Customer inquiries and contact form submissions
3. **hero_images** - Images for the website hero section
4. **testimonials** - Customer testimonials
5. **jobs** - Job postings
6. **job_applications** - Applications for job postings
7. **blog_categories** - Categories for blog posts
8. **blog_posts** - Blog posts

### Storage Buckets

1. **hero-images** - Public images for hero section
2. **testimonials** - Public images for testimonials
3. **blog-images** - Public images for blog posts
4. **resumes** - Private storage for job application resumes

## Detailed Table Structures

### services
| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | Unique identifier |
| package_name | text | Name of the service package |
| description | text | Detailed description |
| key_features | jsonb | Array of key features |
| target_audience | jsonb | Target customer types |
| suggested_pricing | text | Price range |
| display_order | integer | Display order |
| created_at | timestamptz | Creation timestamp |

### inquiries
| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | Unique identifier |
| full_name | text | Customer's full name |
| email | text | Customer's email |
| phone | text | Customer's phone |
| company | text | Customer's company (optional) |
| service_interest | text | Service of interest |
| message | text | Customer's message |
| status | text | Inquiry status (new, contacted, closed) |
| created_at | timestamptz | Creation timestamp |

### hero_images
| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | Unique identifier |
| title | text | Image title |
| image_url | text | Image URL |
| is_active | boolean | Active status |
| created_at | timestamptz | Creation timestamp |

### testimonials
| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | Unique identifier |
| name | text | Customer name |
| company | text | Customer company |
| role | text | Customer role |
| content | text | Testimonial content |
| rating | integer | Rating (1-5) |
| avatar_url | text | Avatar image URL |
| is_active | boolean | Active status |
| created_at | timestamptz | Creation timestamp |

### jobs
| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | Unique identifier |
| title | text | Job title |
| description | text | Job description |
| location | text | Job location |
| employment_type | text | Employment type |
| salary_range | text | Salary range |
| responsibilities | jsonb | Job responsibilities |
| requirements | jsonb | Job requirements |
| benefits | jsonb | Job benefits |
| is_published | boolean | Publication status |
| application_link | text | Application link |
| created_at | timestamptz | Creation timestamp |
| updated_at | timestamptz | Last update timestamp |

### job_applications
| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | Unique identifier |
| job_id | uuid (FK) | Reference to job |
| full_name | text | Applicant name |
| email | text | Applicant email |
| phone | text | Applicant phone |
| cover_letter | text | Cover letter |
| resume_url | text | Resume URL |
| status | text | Application status |
| notes | text | Application notes |
| created_at | timestamptz | Creation timestamp |
| updated_at | timestamptz | Last update timestamp |

### blog_categories
| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | Unique identifier |
| name | text | Category name |
| slug | text | URL-friendly name |
| description | text | Category description |
| created_at | timestamptz | Creation timestamp |
| updated_at | timestamptz | Last update timestamp |

### blog_posts
| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | Unique identifier |
| title | text | Post title |
| slug | text | URL-friendly title |
| content | text | Post content |
| excerpt | text | Post excerpt |
| cover_image_url | text | Cover image URL |
| author | text | Post author |
| category_id | uuid (FK) | Reference to category |
| is_published | boolean | Publication status |
| published_at | timestamptz | Publication timestamp |
| created_at | timestamptz | Creation timestamp |
| updated_at | timestamptz | Last update timestamp |

## Functions and Triggers

### update_updated_at_column()
Updates the `updated_at` timestamp for tables that have this column.

Applied to:
- jobs
- job_applications
- blog_categories
- blog_posts

### set_published_at()
Automatically sets the `published_at` timestamp when a blog post is published.

Applied to:
- blog_posts

## Indexes

Indexes have been created on frequently queried columns for better performance:
- services.display_order
- inquiries.status
- inquiries.created_at
- hero_images.is_active
- testimonials.is_active
- jobs.is_published
- jobs.created_at
- job_applications.job_id
- job_applications.status
- blog_posts.category_id
- blog_posts.is_published
- blog_posts.published_at
- blog_posts.slug
- blog_categories.slug

## Sample Data

The script includes sample data for:
- Services (from the original migration)
- Blog categories (Technology, Business, Engineering)

## How to Use

1. Copy the SQL script to your Supabase SQL editor
2. Run the script in your Supabase dashboard
3. The script is safe to run multiple times due to `IF NOT EXISTS` and `ON CONFLICT` clauses

## Storage Buckets

After running the script, you'll have four storage buckets:
1. **hero-images** - Public access for hero section images
2. **testimonials** - Public access for testimonial images
3. **blog-images** - Public access for blog post images
4. **resumes** - Private access for job application resumes

To upload files to these buckets, authenticated users can upload, and public users can read from the public buckets.