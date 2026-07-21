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
  
  // MBSTUPC additional metadata
  technologies?: string[];
  size?: string;
  facebook?: string;
  twitter?: string;
  
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

export interface ValidationIssue {
  type: 'error' | 'warning' | 'info';
  code: string;
  message: string;
  description: string;
}

export function validateJob(job: Job): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  
  // Title checks
  const titleLower = (job.title || '').toLowerCase();
  if (!job.title || job.title.trim().length < 4) {
    issues.push({ 
      type: 'error', 
      code: 'SHORT_TITLE', 
      message: 'Job title is too short or missing',
      description: 'The job title is under 4 characters or empty, indicating extraction failure.'
    });
  } else if (
    titleLower.includes('unknown role') || 
    titleLower.includes('unknown') || 
    titleLower.includes('test job') || 
    titleLower.includes('untitled') || 
    titleLower === 'developer' || 
    titleLower === 'engineer'
  ) {
    issues.push({ 
      type: 'warning', 
      code: 'GENERIC_TITLE', 
      message: 'Generic/placeholder title detected',
      description: 'The crawler could only find a general role name (e.g., "Developer") rather than a specific specialization.'
    });
  }
  
  // Summary checks
  if (!job.summary || job.summary.trim().length < 15) {
    issues.push({ 
      type: 'warning', 
      code: 'MINIMAL_DESC', 
      message: 'No detailed role summary available',
      description: 'The scraper could not find a paragraph description or list of duties for this specific vacancy on the career page.'
    });
  }
  
  // Skills checks
  if (!job.skills || job.skills.length === 0) {
    issues.push({ 
      type: 'warning', 
      code: 'NO_SKILLS', 
      message: 'No specific skills or tech tags identified',
      description: 'No modern tech keywords (like React, Docker, Python) were explicitly mapped in the listing.'
    });
  }
  
  // Experience checks
  if (!job.experienceLevel || job.experienceLevel === 'unspecified') {
    issues.push({ 
      type: 'info', 
      code: 'UNSPECIFIED_EXP', 
      message: 'Experience level not explicitly stated',
      description: 'The listing does not mention specific year boundaries or terms like "Senior", "Junior", or "Lead".'
    });
  }
  
  // Link checks
  if (!job.link || !job.link.startsWith('http')) {
    issues.push({ 
      type: 'error', 
      code: 'INVALID_LINK', 
      message: 'Application link is missing or invalid',
      description: 'The target destination URL is empty, missing a schema, or is completely malformed.'
    });
  } else if (
    job.link.includes('example.com') || 
    job.link === '#' || 
    job.link.trim().endsWith('.com') || 
    job.link.trim().endsWith('.com/') || 
    job.link.trim().endsWith('.bd') || 
    job.link.trim().endsWith('.bd/') ||
    job.link.trim().endsWith('.net') ||
    job.link.trim().endsWith('.net/')
  ) {
    issues.push({ 
      type: 'warning', 
      code: 'PLACEHOLDER_LINK', 
      message: 'Generic company homepage link',
      description: 'The application URL points to the generic top-level domain homepage instead of a specific job application form.'
    });
  }
  
  // Salary checks
  const salLower = (job.salary || '').toLowerCase();
  if (!job.salary || job.salary.trim() === '' || salLower.includes('negotiable') || salLower.includes('undisclosed')) {
    issues.push({ 
      type: 'info', 
      code: 'UNDISCLOSED_SALARY', 
      message: 'Compensation details are undisclosed',
      description: 'No numerical salary range was found in this listing; the budget is marked as Negotiable.'
    });
  }
  
  return issues;
}
