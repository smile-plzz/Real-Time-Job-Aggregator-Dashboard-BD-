/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Company {
  name: string;
  location: string;
  website: string | null;
  career: string | null;
  email: string | null;
  linkedin: string | null;
  contact: string | null;
  
  // Frontend/Status tracking
  scrapeStatus?: 'idle' | 'scraping' | 'completed' | 'failed';
  lastScraped?: string;
  jobCount?: number;
  error?: string;
}

export interface Job {
  id: string;
  companyName: string;
  title: string;
  department: string;
  location: string;
  type: string; // Full-time, Part-time, Internship, Remote, etc.
  link: string;
  skills: string[];
  experienceLevel: 'junior' | 'mid' | 'senior' | 'lead' | 'intern' | 'unspecified';
  category: 'frontend' | 'backend' | 'fullstack' | 'mobile' | 'devops' | 'qa' | 'product' | 'design' | 'other';
  salary?: string;
  summary?: string;
  dateAdded: string;
  source?: string; // 'json-ld' | 'hydration' | 'heuristics' | 'manual' | 'seed'
}

export interface ScrapeStats {
  totalCompanies: number;
  scrapedCompanies: number;
  totalJobs: number;
  activeCompaniesCount: number;
  categoryBreakdown: Record<string, number>;
  experienceBreakdown: Record<string, number>;
}
