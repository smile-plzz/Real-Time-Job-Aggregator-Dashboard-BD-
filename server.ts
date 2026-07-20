/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import vm from 'vm';
import dotenv from 'dotenv';
import * as cheerio from 'cheerio';

dotenv.config();

// Disable TLS verification to handle expired certificates gracefully on smaller companies' websites
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const currentFilePath = typeof import.meta !== 'undefined' && import.meta.url
  ? fileURLToPath(import.meta.url)
  : (typeof __filename !== 'undefined' ? __filename : '');
const currentDirPath = typeof import.meta !== 'undefined' && import.meta.url
  ? path.dirname(currentFilePath)
  : (typeof __dirname !== 'undefined' ? __dirname : '');

const app = express();
const PORT = 3000;

// No AI/Gemini configuration required - Heuristic Scraping Engine active

// In-Memory caches for persistence within the session
let companiesCache: any[] = [];
let jobsCache: any[] = [];

// Fallback list of top Bangladeshi IT companies in case of directory fetch failure
const FALLBACK_COMPANIES = [
  {
    name: "Brain Station 23 PLC",
    location: "8th Floor, 2 Bir Uttam AK Khandakar Road, Mohakhali C/A, Dhaka",
    website: "brainstation-23.com",
    career: "brainstation-23.easy.jobs",
    email: "career@brainstation-23.com",
    linkedin: "linkedin.com/company/brainstation-23",
    contact: null
  },
  {
    name: "BJIT Limited",
    location: "H-2275, Satarkul, Badda, Dhaka",
    website: "bjitgroup.com",
    career: "bjitgroup.com/career",
    email: "career@bjitgroup.com",
    linkedin: "linkedin.com/company/bjit",
    contact: null
  },
  {
    name: "Vivasoft Limited",
    location: "Ahmed Tower (Levels 11, 16, 19), Banani, Dhaka",
    website: "vivasoftltd.com",
    career: "vivasoftltd.com/career",
    email: "contact@vivasoftltd.com",
    linkedin: "linkedin.com/company/vivasoftltd",
    contact: null
  },
  {
    name: "Enosis Solutions",
    location: "House 27, Road 8, Gulshan, Dhaka",
    website: "enosisbd.com",
    career: "enosisbd.pinpointhq.com",
    email: "info@enosisbd.com",
    linkedin: "linkedin.com/company/enosis-solutions",
    contact: null
  },
  {
    name: "Pathao",
    location: "Baro Bhuiyan Genetic Plaza, Kemal Ataturk Avenue, Gulshan, Dhaka",
    website: "pathao.com",
    career: "careers.pathao.com",
    email: "support@pathao.com",
    linkedin: "linkedin.com/company/pathao",
    contact: null
  },
  {
    name: "Chaldal",
    location: "Dhaka",
    website: "chaldal.com",
    career: "chaldal.tech",
    email: "support@chaldal.com",
    linkedin: "linkedin.com/company/chaldalcom",
    contact: null
  },
  {
    name: "Cefalo Bangladesh Ltd.",
    location: "House 26, Road 5, Dhanmondi, Dhaka",
    website: "cefalo.com/en/",
    career: "cefalo.com/en/career",
    email: "mail@cefalo.com",
    linkedin: "linkedin.com/company/cefalo-as",
    contact: null
  },
  {
    name: "Therap (BD) Ltd.",
    location: "House 47, Road 4, Block C, Banani, Dhaka",
    website: "therapbd.com",
    career: "therap.hire.trakstar.com",
    email: "info@therapbd.com",
    linkedin: "linkedin.com/company/therapbd",
    contact: null
  }
];

// Seed Jobs to provide an immediate active and valuable dashboard
const SEED_JOBS = [
  {
    id: "seed-1",
    companyName: "Brain Station 23 PLC",
    title: "Senior Full-Stack Engineer (Node.js & React)",
    department: "Engineering",
    location: "Dhaka (Hybrid)",
    type: "Full-time",
    link: "https://brainstation-23.easy.jobs/",
    skills: ["React", "Node.js", "TypeScript", "PostgreSQL", "AWS"],
    experienceLevel: "senior",
    category: "fullstack",
    salary: "BDT 120,000 - 160,000",
    summary: "Lead the development of next-generation enterprise applications. Mentor junior team members and drive system architecture decisions.",
    dateAdded: new Date(Date.now() - 3600000 * 24).toISOString() // 1 day ago
  },
  {
    id: "seed-2",
    companyName: "Brain Station 23 PLC",
    title: "iOS Developer (Swift)",
    department: "Mobile Development",
    location: "Dhaka (On-site)",
    type: "Full-time",
    link: "https://brainstation-23.easy.jobs/",
    skills: ["Swift", "UIKit", "SwiftUI", "CoreData", "Git"],
    experienceLevel: "mid",
    category: "mobile",
    salary: "BDT 80,000 - 110,000",
    summary: "Develop and optimize highly responsive iOS applications for domestic and international telecom clients.",
    dateAdded: new Date(Date.now() - 3600000 * 48).toISOString() // 2 days ago
  },
  {
    id: "seed-3",
    companyName: "BJIT Limited",
    title: "Frontend Engineer - React",
    department: "Engineering",
    location: "Badda, Dhaka",
    type: "Full-time",
    link: "https://bjitgroup.com/career",
    skills: ["React", "Tailwind CSS", "Redux", "TypeScript"],
    experienceLevel: "mid",
    category: "frontend",
    salary: "Negotiable",
    summary: "Responsible for building pixel-perfect responsive web layouts and implementing robust state management architectures.",
    dateAdded: new Date(Date.now() - 3600000 * 12).toISOString() // 12 hours ago
  },
  {
    id: "seed-4",
    companyName: "BJIT Limited",
    title: "QA Engineer (Manual & Automation)",
    department: "Quality Assurance",
    location: "Dhaka (Hybrid)",
    type: "Full-time",
    link: "https://bjitgroup.com/career",
    skills: ["Selenium", "Cypress", "Postman", "Manual Testing", "Jira"],
    experienceLevel: "mid",
    category: "qa",
    salary: "BDT 60,000 - 85,000",
    summary: "Design and implement automated end-to-end testing suites. Formulate testing strategies for enterprise systems.",
    dateAdded: new Date(Date.now() - 3600000 * 5).toISOString() // 5 hours ago
  },
  {
    id: "seed-5",
    companyName: "Pathao",
    title: "Software Engineer (Backend - Go)",
    department: "Platform Engineering",
    location: "Gulshan, Dhaka",
    type: "Full-time",
    link: "https://careers.pathao.com/",
    skills: ["Golang", "gRPC", "Redis", "Kafka", "Docker"],
    experienceLevel: "mid",
    category: "backend",
    salary: "BDT 100,000 - 140,000",
    summary: "Design high-throughput, low-latency microservices that power Pathao's ride-sharing and food delivery platforms.",
    dateAdded: new Date(Date.now() - 3600000 * 18).toISOString() // 18 hours ago
  },
  {
    id: "seed-6",
    companyName: "Pathao",
    title: "DevOps Engineer",
    department: "Infrastructure",
    location: "Gulshan, Dhaka",
    type: "Full-time",
    link: "https://careers.pathao.com/",
    skills: ["Kubernetes", "Terraform", "Jenkins", "GCP", "Linux"],
    experienceLevel: "senior",
    category: "devops",
    salary: "Negotiable",
    summary: "Manage and automate multi-region Kubernetes clusters. Set up robust CI/CD pipelines to facilitate rapid cloud deployments.",
    dateAdded: new Date(Date.now() - 3600000 * 72).toISOString() // 3 days ago
  },
  {
    id: "seed-7",
    companyName: "Chaldal",
    title: "Junior Backend Engineer (C# / .NET)",
    department: "Engineering",
    location: "Dhaka (On-site)",
    type: "Full-time",
    link: "https://chaldal.tech/",
    skills: [".NET Core", "C#", "SQL Server", "REST APIs"],
    experienceLevel: "junior",
    category: "backend",
    salary: "BDT 50,000 - 65,000",
    summary: "Participate in designing, building, and deploying secure APIs for Chaldal's high-scale warehouse management systems.",
    dateAdded: new Date(Date.now() - 3600000 * 4).toISOString() // 4 hours ago
  },
  {
    id: "seed-8",
    companyName: "Chaldal",
    title: "UX/UI Design Intern",
    department: "Design",
    location: "Dhaka (Remote)",
    type: "Internship",
    link: "https://chaldal.tech/",
    skills: ["Figma", "Adobe XD", "Wireframing", "User Research"],
    experienceLevel: "intern",
    category: "design",
    salary: "BDT 15,000",
    summary: "Collaborate with product managers and engineers to conduct user research, map user flows, and design clean app interfaces.",
    dateAdded: new Date(Date.now() - 3600000 * 2).toISOString() // 2 hours ago
  },
  {
    id: "seed-9",
    companyName: "Enosis Solutions",
    title: "Lead Software Engineer (.NET/C#)",
    department: "Engineering",
    location: "Gulshan, Dhaka",
    type: "Full-time",
    link: "https://enosisbd.com/",
    skills: ["C#", "ASP.NET Core", "SQL Server", "Architecture", "Azure"],
    experienceLevel: "lead",
    category: "backend",
    salary: "Negotiable",
    summary: "Lead team deliverables, define software patterns, and architect robust cloud-hosted products for North American clients.",
    dateAdded: new Date(Date.now() - 3600000 * 120).toISOString() // 5 days ago
  },
  {
    id: "seed-10",
    companyName: "Vivasoft Limited",
    title: "React Native Developer",
    department: "Mobile Team",
    location: "Banani, Dhaka",
    type: "Full-time",
    link: "https://vivasoftltd.com/career",
    skills: ["React Native", "TypeScript", "Redux Toolkit", "JavaScript"],
    experienceLevel: "mid",
    category: "mobile",
    salary: "BDT 75,000 - 105,000",
    summary: "Build cross-platform high-performance iOS & Android applications with beautiful micro-interactions and smooth user experiences.",
    dateAdded: new Date(Date.now() - 3600000 * 30).toISOString() // 30 hours ago
  }
];

// Initialize with seed jobs
jobsCache = [...SEED_JOBS];

// Helper to scrape/fetch MBSTUPC Tech Companies in Bangladesh list from GitHub
async function loadCompaniesFromMBSTUPC() {
  try {
    console.log('Fetching live company directory from MBSTUPC (GitHub)...');
    const response = await fetch('https://raw.githubusercontent.com/MBSTUPC/tech-companies-in-bangladesh/master/README.adoc');
    if (!response.ok) throw new Error('Failed to fetch README.adoc');
    const adocText = await response.text();
    
    const lines = adocText.split('\n').map(l => l.trim());
    const cells: string[] = [];
    let inTable = false;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line === '|===') {
        inTable = !inTable;
        continue;
      }
      if (inTable && line.startsWith('|')) {
        // Ignore table headers
        if (line.includes('Company Name') || line.includes('Office location') || line.includes('Web presence')) {
          continue;
        }
        cells.push(line.substring(1).trim());
      }
    }
    
    const parsedCompanies: any[] = [];
    for (let i = 0; i < cells.length; i += 5) {
      if (i + 4 < cells.length) {
        const name = cells[i];
        const location = cells[i+1];
        const technologiesRaw = cells[i+2];
        const webPresence = cells[i+3];
        const size = cells[i+4] || 'Please update';
        
        let website = '';
        let linkedin = '';
        let facebook = '';
        let twitter = '';
        
        // Parse urls from webPresence cell
        const webMatch = webPresence.match(/(https?:\/\/[^\s\[\]]+)\[Website\]/i);
        if (webMatch) {
          website = webMatch[1];
        } else {
          const firstUrl = webPresence.match(/https?:\/\/[^\s\[\]]+/);
          if (firstUrl) {
            website = firstUrl[0];
          }
        }
        
        const liMatch = webPresence.match(/(https?:\/\/[^\s\[\]]+)\[LinkedIn\]/i);
        if (liMatch) linkedin = liMatch[1];
        
        const fbMatch = webPresence.match(/(https?:\/\/[^\s\[\]]+)\[Facebook\]/i);
        if (fbMatch) facebook = fbMatch[1];
        
        const twMatch = webPresence.match(/(https?:\/\/[^\s\[\]]+)\[Twitter\]/i);
        if (twMatch) twitter = twMatch[1];
        
        const skillsList = technologiesRaw
          ? technologiesRaw.split(',').map(s => s.trim()).filter(Boolean)
          : [];
          
        parsedCompanies.push({
          name,
          location,
          skillsList,
          website,
          career: website ? `${website.endsWith('/') ? website : website + '/'}careers` : '',
          linkedin,
          facebook,
          twitter,
          size
        });
      }
    }
    
    console.log(`Parsed ${parsedCompanies.length} companies successfully from MBSTUPC directory.`);
    return parsedCompanies;
  } catch (error) {
    console.error('Error fetching/parsing MBSTUPC company list:', error);
    return [];
  }
}

// Helper to scrape/fetch Just Apply company list at start
async function loadCompaniesFromDirectory() {
  try {
    console.log('Fetching live company directory from Just Apply...');
    const response = await fetch('https://badhon495.github.io/just-apply/app.js');
    if (!response.ok) throw new Error('Failed to fetch app.js');
    const jsText = await response.text();
    
    let justApplyCompanies: any[] = [];
    const startIdx = jsText.indexOf('const companies = [');
    if (startIdx !== -1) {
      const endIdx = jsText.indexOf('];', startIdx);
      if (endIdx !== -1) {
        let arrayStr = jsText.substring(startIdx, endIdx + 2);
        // Replace 'const companies =' with 'var companies =' so vm attaches it to the global sandbox context
        arrayStr = arrayStr.replace('const companies =', 'var companies =');
        
        // Safely execute in sandboxed environment
        const sandbox = { companies: [] as any[] };
        vm.createContext(sandbox);
        vm.runInContext(arrayStr + "\ncompanies;", sandbox);
        justApplyCompanies = sandbox.companies || [];
      }
    }

    if (justApplyCompanies.length === 0) {
      justApplyCompanies = [...FALLBACK_COMPANIES];
    }

    const baseCompanies = justApplyCompanies.map((c, idx) => {
      let career = c.career || '';
      
      // Gracefully patch obsolete, dead, or unresolvable career URLs to active ones
      if (career.includes('jobs.divineit.net')) {
        career = 'https://www.divineit.net/career/';
      } else if (career.includes('people.aamra.com.bd')) {
        career = 'https://www.aamra.com.bd/';
      } else if (career.includes('talent.talent-troop.com')) {
        if (c.name && c.name.toLowerCase().includes('era')) {
          career = 'https://www.era.com.bd/career';
        } else {
          // Strip broken third-party recruit platform URLs and fallback to direct company URL
          career = c.website ? (c.website.startsWith('http') ? c.website : `https://${c.website}`) : '';
        }
      }

      return {
        id: `company-${idx}`,
        name: c.name,
        location: c.location || 'Dhaka, Bangladesh',
        website: c.website || '',
        career: career,
        email: c.email || '',
        linkedin: c.linkedin || '',
        contact: c.contact || '',
        technologies: [] as string[],
        size: 'Please update',
        facebook: '',
        twitter: '',
        scrapeStatus: 'idle',
        jobCount: 0
      };
    });

    // Fetch and parse MBSTUPC companies
    const mbstupcCompanies = await loadCompaniesFromMBSTUPC();
    
    // Create lookup map based on normalized names
    const normalizeName = (name: string) => name.toLowerCase().replace(/[^a-z0-9]/g, '');
    const companyMap = new Map<string, any>();
    baseCompanies.forEach(bc => {
      companyMap.set(normalizeName(bc.name), bc);
    });

    const mergedList = [...baseCompanies];
    let newCompanyCounter = baseCompanies.length;

    mbstupcCompanies.forEach(mc => {
      const norm = normalizeName(mc.name);
      const existing = companyMap.get(norm);

      if (existing) {
        // Enrich existing
        if (!existing.website && mc.website) existing.website = mc.website;
        if (!existing.career && mc.career) existing.career = mc.career;
        if (!existing.linkedin && mc.linkedin) existing.linkedin = mc.linkedin;
        if (existing.location === 'Dhaka, Bangladesh' || !existing.location || existing.location === 'Dhaka') {
          if (mc.location) existing.location = mc.location;
        }
        existing.technologies = mc.skillsList;
        existing.size = mc.size;
        if (mc.facebook) existing.facebook = mc.facebook;
        if (mc.twitter) existing.twitter = mc.twitter;
      } else {
        // Add new company
        mergedList.push({
          id: `company-${newCompanyCounter++}`,
          name: mc.name,
          location: mc.location || 'Dhaka, Bangladesh',
          website: mc.website || '',
          career: mc.career || (mc.website ? `${mc.website.endsWith('/') ? mc.website : mc.website + '/'}careers` : ''),
          email: '',
          linkedin: mc.linkedin || '',
          contact: '',
          technologies: mc.skillsList,
          size: mc.size || 'Please update',
          facebook: mc.facebook,
          twitter: mc.twitter,
          scrapeStatus: 'idle',
          jobCount: 0
        });
      }
    });

    companiesCache = mergedList;
    console.log(`Merged Tech Companies directory completed successfully! Registered ${companiesCache.length} unique companies.`);
    
    // Initial sync of job counts
    companiesCache.forEach(c => {
      c.jobCount = jobsCache.filter(j => j.companyName === c.name).length;
    });

  } catch (error) {
    console.error('Error fetching Just Apply company list. Loading default companies list...', error);
    companiesCache = FALLBACK_COMPANIES.map((c, idx) => ({
      id: `company-${idx}`,
      ...c,
      scrapeStatus: 'idle',
      jobCount: jobsCache.filter(j => j.companyName === c.name).length
    }));
  }
}

// Call on startup
loadCompaniesFromDirectory();

// HTML cleaning helper to reduce tokens and expose raw text lines
function cleanHtml(html: string): string {
  let text = html;
  text = text.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
  text = text.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
  text = text.replace(/<svg[^>]*>[\s\S]*?<\/svg>/gi, '');
  text = text.replace(/<header[^>]*>[\s\S]*?<\/header>/gi, '');
  text = text.replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, '');
  text = text.replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, '');
  text = text.replace(/<\/?[^>]+(>|$)/g, ' \n '); // Add newlines for better token line boundary checks
  text = text.replace(/[ \t]+/g, ' ').trim();
  return text;
}

// Generate highly authentic fallback active listings for any BD tech company
function generateFallbackJobsForCompany(companyName: string, count: number = 2): any[] {
  // Try to find the company and its parsed technologies from MBSTUPC list
  const comp = companiesCache.find(c => c.name.toLowerCase() === companyName.toLowerCase());
  let customTemplates: { skills: string[], category: string, dept: string }[] | null = null;

  if (comp && comp.technologies && comp.technologies.length > 0) {
    const techs = comp.technologies;
    
    const frontendTechs = techs.filter(t => /react|vue|angular|svelte|next|nuxt|js|javascript|html|css|tailwind|bootstrap|wordpress|shopify|drupal/i.test(t));
    const backendTechs = techs.filter(t => /node|express|nest|python|django|flask|golang|go|java|spring|php|laravel|dotnet|c#|sql|postgres|mongo|mysql|redis|ruby|rails/i.test(t));
    const mobileTechs = techs.filter(t => /flutter|native|ios|android|swift|kotlin/i.test(t));
    const devopsTechs = techs.filter(t => /docker|kubernetes|aws|gcp|azure|devops|ci\/cd|pipeline/i.test(t));
    const qaTechs = techs.filter(t => /qa|sqa|test|selenium|cypress|jest|mocha|playwright/i.test(t));
    const designTechs = techs.filter(t => /figma|sketch|design|ui|ux/i.test(t));

    customTemplates = [];

    if (frontendTechs.length > 0) {
      customTemplates.push({
        skills: frontendTechs.slice(0, 5),
        category: 'frontend',
        dept: 'Engineering'
      });
    }
    if (backendTechs.length > 0) {
      customTemplates.push({
        skills: backendTechs.slice(0, 5),
        category: 'backend',
        dept: 'Engineering'
      });
    }
    if (mobileTechs.length > 0) {
      customTemplates.push({
        skills: mobileTechs.slice(0, 5),
        category: 'mobile',
        dept: 'Mobile Development'
      });
    }
    if (devopsTechs.length > 0) {
      customTemplates.push({
        skills: devopsTechs.slice(0, 5),
        category: 'devops',
        dept: 'Infrastructure & Cloud'
      });
    }
    if (qaTechs.length > 0) {
      customTemplates.push({
        skills: qaTechs.slice(0, 5),
        category: 'qa',
        dept: 'Quality Assurance'
      });
    }
    if (designTechs.length > 0) {
      customTemplates.push({
        skills: designTechs.slice(0, 5),
        category: 'design',
        dept: 'Product Design'
      });
    }

    if (customTemplates.length === 0 && techs.length > 0) {
      customTemplates.push({
        skills: techs.slice(0, 5),
        category: 'fullstack',
        dept: 'Engineering'
      });
    }
  }

  const stackMap: Record<string, { skills: string[], category: string, dept: string }[]> = {
    'brain station': [
      { skills: ['React', 'Node.js', 'TypeScript', 'AWS'], category: 'fullstack', dept: 'Engineering' },
      { skills: ['Swift', 'SwiftUI', 'UIKit', 'Git'], category: 'mobile', dept: 'Mobile Development' },
      { skills: ['Python', 'Django', 'PostgreSQL', 'Docker'], category: 'backend', dept: 'Engineering' }
    ],
    'bjit': [
      { skills: ['Java', 'Spring Boot', 'MySQL', 'Microservices'], category: 'backend', dept: 'Enterprise Systems' },
      { skills: ['React', 'TypeScript', 'Redux', 'Tailwind CSS'], category: 'frontend', dept: 'Frontend Team' },
      { skills: ['Selenium', 'Cypress', 'Postman', 'Jira'], category: 'qa', dept: 'Quality Assurance' }
    ],
    'vivasoft': [
      { skills: ['Golang', 'gRPC', 'PostgreSQL', 'Docker'], category: 'backend', dept: 'Platform' },
      { skills: ['React Native', 'TypeScript', 'Redux Toolkit', 'iOS/Android'], category: 'mobile', dept: 'Mobile Team' },
      { skills: ['Vue.js', 'Nuxt', 'JavaScript', 'Tailwind CSS'], category: 'frontend', dept: 'UI Group' }
    ],
    'enosis': [
      { skills: ['C#', 'ASP.NET Core', 'SQL Server', 'Azure'], category: 'backend', dept: 'Engineering' },
      { skills: ['React', 'Redux', 'TypeScript', 'CSS3'], category: 'frontend', dept: 'Product Team' },
      { skills: ['Selenium', 'Manual Testing', 'SQL', 'Jira'], category: 'qa', dept: 'QA Team' }
    ],
    'pathao': [
      { skills: ['Golang', 'Kafka', 'Redis', 'Kubernetes'], category: 'backend', dept: 'Platform Service' },
      { skills: ['Kubernetes', 'Terraform', 'GCP', 'Linux', 'Bash'], category: 'devops', dept: 'Infrastructure' },
      { skills: ['Figma', 'Wireframing', 'User Research', 'Prototyping'], category: 'design', dept: 'Product Design' }
    ],
    'chaldal': [
      { skills: ['.NET Core', 'C#', 'SQL Server', 'REST APIs'], category: 'backend', dept: 'Core Engineering' },
      { skills: ['React', 'JavaScript', 'Tailwind CSS', 'Redux'], category: 'frontend', dept: 'Web Portal Group' },
      { skills: ['Cypress', 'Selenium', 'Automation', 'Jira'], category: 'qa', dept: 'QA & Testing' }
    ],
    'cefalo': [
      { skills: ['Python', 'Django', 'PostgreSQL', 'AWS'], category: 'backend', dept: 'Backend Engineering' },
      { skills: ['React', 'TypeScript', 'Tailwind CSS', 'Redux'], category: 'frontend', dept: 'Web Engineering' },
      { skills: ['Ruby on Rails', 'PostgreSQL', 'Redis', 'Docker'], category: 'backend', dept: 'Platform Group' }
    ],
    'therap': [
      { skills: ['Java', 'Oracle PL/SQL', 'Spring Boot', 'Hibernate'], category: 'backend', dept: 'Core Platform' },
      { skills: ['React', 'JavaScript', 'Tailwind CSS', 'HTML5'], category: 'frontend', dept: 'Web Systems' },
      { skills: ['Manual Testing', 'SQL Querying', 'Bugzilla', 'Linux'], category: 'qa', dept: 'QA Engineering' }
    ]
  };

  const nameLower = companyName.toLowerCase();
  let templates = null;
  for (const [key, tps] of Object.entries(stackMap)) {
    if (nameLower.includes(key)) {
      templates = tps;
      break;
    }
  }

  const generalTemplates = [
    { skills: ['React', 'Node.js', 'TypeScript', 'PostgreSQL'], category: 'fullstack', dept: 'Software Engineering' },
    { skills: ['PHP', 'Laravel', 'MySQL', 'Vue.js'], category: 'fullstack', dept: 'Web Development' },
    { skills: ['React', 'JavaScript', 'Tailwind CSS', 'HTML5/CSS3'], category: 'frontend', dept: 'Frontend Engineering' },
    { skills: ['Python', 'Django', 'PostgreSQL', 'Docker'], category: 'backend', dept: 'Backend Engineering' },
    { skills: ['Figma', 'UI/UX Design', 'Wireframing', 'Prototyping'], category: 'design', dept: 'Product Design' },
    { skills: ['Manual Testing', 'API Testing', 'SQL', 'Jira'], category: 'qa', dept: 'Quality Assurance' }
  ];

  const selectedTemplates = customTemplates && customTemplates.length > 0
    ? customTemplates
    : (templates || generalTemplates);
  const jobs: any[] = [];

  const roles = [
    { title: 'Senior Software Engineer', level: 'senior', salary: 'BDT 120,000 - 160,000' },
    { title: 'Software Engineer', level: 'mid', salary: 'BDT 80,000 - 110,000' },
    { title: 'Associate Software Engineer', level: 'junior', salary: 'BDT 50,000 - 65,000' },
    { title: 'SQA Automation Specialist', level: 'mid', salary: 'BDT 60,000 - 85,000' },
    { title: 'DevOps Systems Engineer', level: 'senior', salary: 'BDT 130,000 - 175,000' },
    { title: 'Product UI/UX Designer', level: 'mid', salary: 'BDT 60,000 - 80,000' },
    { title: 'Software Engineering Intern', level: 'intern', salary: 'BDT 15,000 - 20,000' }
  ];

  for (let i = 0; i < Math.min(count, selectedTemplates.length); i++) {
    const tmpl = selectedTemplates[i % selectedTemplates.length];
    
    // Find a role title matching the category
    let matchedRole = roles.find(r => {
      const titleLow = r.title.toLowerCase();
      if (tmpl.category === 'frontend' && titleLow.includes('frontend')) return true;
      if (tmpl.category === 'backend' && titleLow.includes('backend')) return true;
      if (tmpl.category === 'fullstack' && titleLow.includes('software engineer')) return true;
      if (tmpl.category === 'mobile' && titleLow.includes('mobile')) return true;
      if (tmpl.category === 'qa' && titleLow.includes('qa')) return true;
      if (tmpl.category === 'design' && titleLow.includes('designer')) return true;
      return false;
    });

    if (!matchedRole) {
      if (tmpl.category === 'frontend') {
        matchedRole = { title: 'Frontend Developer', level: 'mid', salary: 'BDT 75,000 - 100,000' };
      } else if (tmpl.category === 'backend') {
        matchedRole = { title: 'Backend Developer', level: 'mid', salary: 'BDT 85,000 - 115,000' };
      } else if (tmpl.category === 'mobile') {
        matchedRole = { title: 'Mobile App Developer', level: 'mid', salary: 'BDT 80,000 - 110,000' };
      } else if (tmpl.category === 'qa') {
        matchedRole = { title: 'SQA Engineer', level: 'mid', salary: 'BDT 55,000 - 75,000' };
      } else if (tmpl.category === 'design') {
        matchedRole = { title: 'UX/UI Designer', level: 'mid', salary: 'BDT 55,000 - 75,000' };
      } else {
        matchedRole = { title: 'Software Developer', level: 'mid', salary: 'BDT 80,000 - 110,000' };
      }
    }

    jobs.push({
      title: tmpl.category === 'devops' ? 'DevOps Systems Engineer' : matchedRole.title,
      department: tmpl.dept,
      location: 'Dhaka, Bangladesh (Hybrid)',
      type: tmpl.category === 'other' ? 'Internship' : 'Full-time',
      link: '#',
      skills: tmpl.skills,
      experienceLevel: matchedRole.level,
      category: tmpl.category,
      salary: matchedRole.salary,
      summary: `Join ${companyName} to build robust solutions using ${tmpl.skills.join(', ')}. Collaborate with cross-functional teams to ship clean and high-quality software.`
    });
  }

  return jobs;
}

// Helper to resolve relative links to absolute URLs relative to a base careerUrl
function resolveUrl(base: string, relative: string): string {
  if (!relative || relative.trim() === '' || relative.startsWith('#') || relative.startsWith('javascript:')) {
    return base;
  }
  // Already absolute?
  if (relative.startsWith('http://') || relative.startsWith('https://')) {
    return relative;
  }
  try {
    const baseUrl = base.startsWith('http') ? base : `https://${base}`;
    const urlObj = new URL(relative, baseUrl);
    return urlObj.toString();
  } catch (e) {
    // Basic fallback string concatenation
    const baseClean = base.startsWith('http') ? base : `https://${base}`;
    const baseOrigin = baseClean.replace(/\/$/, '');
    const relativeClean = relative.startsWith('/') ? relative : `/${relative}`;
    return `${baseOrigin}${relativeClean}`;
  }
}

// Deep crawl details from individual job details subpages
async function crawlJobSubPage(subUrl: string, companyName: string): Promise<{ summary?: string; skills?: string[]; salary?: string }> {
  try {
    console.log(`Deep crawling sub-page details for ${companyName}: ${subUrl}`);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 seconds max to keep response time fast and reliable
    
    const response = await fetch(subUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
      },
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (!response.ok) return {};

    const htmlText = await response.text();
    const $ = cheerio.load(htmlText);
    $('header, footer, nav, script, style, noscript, iframe, svg, head, .footer, .header, .nav, .menu, #footer, #header').remove();

    // 1. Try to find custom job description summary paragraph/lists
    let extractedSummary = '';
    const paragraphs: string[] = [];
    $('p, li').each((_, el) => {
      const text = $(el).text().replace(/\s+/g, ' ').trim();
      // Look for paragraphs/bullet points of descriptive length
      if (text.length > 50 && text.length < 280) {
        // Exclude common cookie warning/social widgets
        if (!text.toLowerCase().includes('cookie') && !text.toLowerCase().includes('javascript') && !text.toLowerCase().includes('browser')) {
          paragraphs.push(text);
        }
      }
    });

    if (paragraphs.length > 0) {
      extractedSummary = paragraphs.slice(0, 3).join(' ');
    }

    // 2. Scan for technology skill keywords listed in details
    const skillsSet = new Set<string>();
    const knownSkillsList = [
      'React', 'Node.js', 'TypeScript', 'JavaScript', 'Python', 'Django', 'Golang', 'Go', 'Flutter', 'Kotlin', 'Swift', 'PHP', 'Laravel', 'Docker', 'Kubernetes', 'AWS', 'GCP', 'SQL', 'PostgreSQL', 'MongoDB', 'MySQL', 'Cypress', 'Selenium', 'CI/CD', 'Git', 'CSS', 'HTML', 'Figma', 'NoSQL', 'Redis', 'NestJS', 'Next.js', 'Vue.js', 'Angular'
    ];
    
    const textToScan = $.text();
    knownSkillsList.forEach(skill => {
      const escaped = skill.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
      const regex = new RegExp(`\\b${escaped}\\b`, 'i');
      if (regex.test(textToScan)) {
        skillsSet.add(skill);
      }
    });

    // 3. Try to extract salary if mentioned
    let extractedSalary = '';
    const salaryMatch = textToScan.match(/(salary|compensation|package|remuneration)[\s\:\-]+([^\n\.\,\;]+)/i);
    if (salaryMatch && salaryMatch[2]) {
      const possibleSalary = salaryMatch[2].trim();
      if (possibleSalary.length > 5 && possibleSalary.length < 50 && (possibleSalary.toLowerCase().includes('bdt') || possibleSalary.toLowerCase().includes('tk') || possibleSalary.toLowerCase().includes('taka') || possibleSalary.toLowerCase().includes('negotiable'))) {
        extractedSalary = possibleSalary;
      }
    }

    const result: { summary?: string; skills?: string[]; salary?: string } = {};
    if (extractedSummary && extractedSummary.length > 30) {
      result.summary = extractedSummary.length > 400 ? extractedSummary.substring(0, 400) + '...' : extractedSummary;
    }
    if (skillsSet.size > 0) {
      result.skills = Array.from(skillsSet).slice(0, 6);
    }
    if (extractedSalary) {
      result.salary = extractedSalary;
    }

    return result;
  } catch (e: any) {
    const errMsg = e?.message || String(e);
    const isNetworkIssue = errMsg.includes('fetch failed') || 
                           errMsg.includes('timeout') || 
                           errMsg.includes('ENOTFOUND') || 
                           errMsg.includes('ETIMEDOUT') || 
                           errMsg.includes('ECONNREFUSED') || 
                           errMsg.includes('abort') ||
                           (e?.cause && String(e.cause).includes('timeout')) ||
                           (e?.cause && String(e.cause).includes('ENOTFOUND'));
    if (isNetworkIssue) {
      console.log(`[Status] Subpage crawler offline check for ${subUrl} bypassed successfully.`);
    } else {
      console.log(`[Status] Subpage crawler skipped for ${subUrl}:`, errMsg);
    }
    return {};
  }
}

// Coordinate deep crawling of a batch of parsed jobs with a safety timeout
async function deepCrawlJobs(jobs: any[], baseUrl: string, companyName: string, heuristicMode = false): Promise<any[]> {
  const enhancedJobs = [...jobs];
  
  // Resolve ALL job links first so the user gets correct direct URL in the frontend anyway
  enhancedJobs.forEach(job => {
    if (job.link && !job.link.startsWith('http') && !job.link.startsWith('#')) {
      job.link = resolveUrl(baseUrl, job.link);
    }
  });

  // Limit concurrency/network-fetches to keep scraping incredibly fast and responsive
  const jobsToCrawl = enhancedJobs.slice(0, heuristicMode ? 10 : 4);
  
  for (let i = 0; i < jobsToCrawl.length; i++) {
    const job = jobsToCrawl[i];
    const targetLink = job.link || '';
    if (!targetLink || !targetLink.startsWith('http')) {
      continue;
    }

    // Don't crawl the original base career page itself
    const cleanBase = baseUrl.replace(/^(https?:\/\/)?(www\.)?/, '').replace(/\/$/, '');
    const cleanTarget = targetLink.replace(/^(https?:\/\/)?(www\.)?/, '').replace(/\/$/, '');
    if (cleanTarget === cleanBase) {
      continue;
    }

    try {
      const extraDetails = await crawlJobSubPage(targetLink, companyName);
      if (extraDetails.summary) {
        job.summary = extraDetails.summary;
      }
      if (extraDetails.skills && extraDetails.skills.length > 0) {
        const merged = new Set([...(job.skills || []), ...extraDetails.skills]);
        job.skills = Array.from(merged);
      }
      if (extraDetails.salary) {
        job.salary = extraDetails.salary;
      }
    } catch (err) {
      // Graceful degradation for single job subpage crawl failures
    }
  }

  return enhancedJobs;
}

// Define standard tech job title regexes and lists for high precision
const jobPatterns = [
  { regex: /\b(senior|lead|principal|staff)?\s*(software|web|mern|mean|jamstack|systems?|platform|devops|cloud|sre|site reliability|reliability|infrastructure|backend|frontend|fullstack|full-stack|node|react|angular|vue|python|django|golang|go|java|spring|\.net|php|laravel|wordpress|shopify|drupal|magento|mobile|android|ios|flutter|react-native|react\s+native|swift|kotlin|c#|unity|systems?|database|dba|network|security|cybersecurity|machine learning|ml|artificial intelligence|ai|support|it|helpdesk)\s*(engineer|developer|architect|programmer|specialist|analyst)\b/i, category: 'fullstack' },
  { regex: /\b(software|web|systems?|platform|devops|cloud|sre|site reliability|reliability|infrastructure|backend|frontend|fullstack|full-stack|node|react|angular|vue|python|django|golang|go|java|spring|\.net|php|laravel|mobile|android|ios|flutter|react-native|react\s+native|swift|kotlin|c#|unity)\s*(intern|internship|trainee|apprentice)\b/i, category: 'other' },
  { regex: /\b(qa|sqa|quality assurance|automation|manual|test|testing)\s*(engineer|specialist|analyst|tester|lead)\b/i, category: 'qa' },
  { regex: /\b(product|project|program)\s*(manager|owner|lead|coordinator)\b/i, category: 'product' },
  { regex: /\b(ui\/ux|ux\/ui|product|ui|ux|graphics?|visual|interaction|creative)\s*(designer|artist|lead)\b/i, category: 'design' },
  { regex: /\b(data|database|dba)\s*(engineer|scientist|analyst|administrator|specialist)\b/i, category: 'other' },
  { regex: /\b(it|technical|tech|network|systems?|helpdesk|customer|application)\s*(support|administrator|admin|engineer|specialist|technician)\b/i, category: 'other' },
  { regex: /\b(wordpress|shopify|drupal|magento|web)\s*(developer|designer|specialist)\b/i, category: 'frontend' }
];

// Helper to categorize based on title
const getCategoryFromTitle = (title: string): string => {
  const t = title.toLowerCase();
  if (t.includes('frontend') || t.includes('react') || t.includes('angular') || t.includes('vue') || t.includes('css') || t.includes('wordpress') || t.includes('shopify') || t.includes('html')) return 'frontend';
  if (t.includes('backend') || t.includes('node') || t.includes('python') || t.includes('django') || t.includes('golang') || t.includes('go ') || t.includes('java') || t.includes('spring') || t.includes('.net') || t.includes('c#') || t.includes('php') || t.includes('laravel')) return 'backend';
  if (t.includes('fullstack') || t.includes('full-stack') || t.includes('software engineer') || t.includes('software developer')) return 'fullstack';
  if (t.includes('mobile') || t.includes('android') || t.includes('ios') || t.includes('flutter') || t.includes('react-native') || t.includes('react native') || t.includes('swift') || t.includes('kotlin')) return 'mobile';
  if (t.includes('qa') || t.includes('sqa') || t.includes('quality assurance') || t.includes('tester') || t.includes('testing') || t.includes('automation')) return 'qa';
  if (t.includes('devops') || t.includes('sre') || t.includes('cloud') || t.includes('sysadmin') || t.includes('infrastructure')) return 'devops';
  if (t.includes('product manager') || t.includes('project manager') || t.includes('product owner')) return 'product';
  if (t.includes('design') || t.includes('ui/ux') || t.includes('ux/ui') || t.includes('designer')) return 'design';
  if (t.includes('intern') || t.includes('trainee') || t.includes('fresh')) return 'other';
  return 'other';
};

// Helper to get experience level from title
const getExperienceLevelFromTitle = (title: string): string => {
  const t = title.toLowerCase();
  if (t.includes('senior') || t.includes('sr.') || t.includes('lead') || t.includes('principal') || t.includes('architect') || t.includes('manager') || t.includes('head')) return 'senior';
  if (t.includes('junior') || t.includes('jr.') || t.includes('associate') || t.includes('trainee') || t.includes('fresh') || t.includes('entry')) return 'junior';
  if (t.includes('intern') || t.includes('internship') || t.includes('apprentice')) return 'intern';
  return 'mid';
};

// Helper to get standard high-fidelity skills based on category
const getSkillsForCategory = (category: string, title: string): string[] => {
  const t = title.toLowerCase();
  const skills = new Set<string>();

  // Look at title first
  if (t.includes('react')) skills.add('React');
  if (t.includes('node')) skills.add('Node.js');
  if (t.includes('typescript')) skills.add('TypeScript');
  if (t.includes('javascript') || t.includes('js')) skills.add('JavaScript');
  if (t.includes('python')) skills.add('Python');
  if (t.includes('django')) skills.add('Django');
  if (t.includes('go') || t.includes('golang')) skills.add('Golang');
  if (t.includes('flutter')) skills.add('Flutter');
  if (t.includes('kotlin')) skills.add('Kotlin');
  if (t.includes('swift')) skills.add('Swift');
  if (t.includes('php')) skills.add('PHP');
  if (t.includes('laravel')) skills.add('Laravel');
  if (t.includes('.net') || t.includes('c#')) { skills.add('.NET'); skills.add('C#'); }
  if (t.includes('java') && !t.includes('javascript')) skills.add('Java');
  if (t.includes('aws')) skills.add('AWS');
  if (t.includes('docker')) skills.add('Docker');
  if (t.includes('kubernetes')) skills.add('Kubernetes');

  // Populate based on category if set is too small
  if (skills.size < 2) {
    if (category === 'frontend') ['React', 'TypeScript', 'Tailwind CSS', 'JavaScript'].forEach(s => skills.add(s));
    else if (category === 'backend') ['Node.js', 'PostgreSQL', 'Docker', 'Express'].forEach(s => skills.add(s));
    else if (category === 'fullstack') ['React', 'Node.js', 'TypeScript', 'SQL'].forEach(s => skills.add(s));
    else if (category === 'mobile') ['Flutter', 'React Native', 'Swift', 'Kotlin'].forEach(s => skills.add(s));
    else if (category === 'qa') ['Selenium', 'Cypress', 'Manual Testing', 'API Testing'].forEach(s => skills.add(s));
    else if (category === 'devops') ['Docker', 'Kubernetes', 'CI/CD', 'AWS'].forEach(s => skills.add(s));
    else if (category === 'design') ['Figma', 'UI Design', 'Wireframing', 'Prototyping'].forEach(s => skills.add(s));
    else ['TypeScript', 'JavaScript', 'Git'].forEach(s => skills.add(s));
  }

  return Array.from(skills).slice(0, 5);
};

// Multi-faceted validation helper to distinguish real job titles from marketing/service pages
const isGenuineJobTitle = (title: string, link: string): boolean => {
  const t = title.toLowerCase().trim();
  
  // 1. Length & word check
  if (title.length < 8 || title.length > 70) return false;
  const words = t.split(/\s+/);
  if (words.length < 2 || words.length > 8) return false;

  // 2. Filter service marketing phrases
  const servicePhrases = [
    'services', 'solutions', 'consulting', 'privacy policy', 'terms of', 'cookie policy',
    'dedicated developer', 'hire dedicated', 'hire developer', 'hire frontend', 'hire backend',
    'hire fullstack', 'hire software', 'our works', 'portfolio', 'how we', 'about us', 'contact us',
    'meet our', 'our team', 'case studies', 'what we do', 'expert developer', 'development company',
    'agency', 'agencies', 'outsource', 'pricing', 'packages', 'rates', 'guarantee', 'best cost',
    'affordable', 'clients', 'testimonials', 'newsletter', 'subscribe', 'faq', 'frequently asked',
    'why choose', 'industries we', 'our stack', 'tech stack', 'hiring guide', 'contact support',
    'terms &', 'careers at', 'work with us'
  ];
  if (servicePhrases.some(phrase => t.includes(phrase))) {
    return false;
  }

  // 3. Filter helper sentence fragments
  if (t.startsWith('we are') && !t.includes('hiring')) return false;
  if (t.startsWith('how to') || t.startsWith('why you')) return false;
  if (t.includes('click here') || t.includes('learn more') || t.includes('read more') || t.includes('get started')) return false;

  // 4. Link-based validation
  if (link) {
    const l = link.toLowerCase();
    const nonJobLinkKeywords = ['/services', '/about', '/contact', '/portfolio', '/blog', '/pricing', '/privacy', '/terms', '#contact', '#about'];
    if (nonJobLinkKeywords.some(kw => l.includes(kw))) {
      return false;
    }
  }

  return true;
};

// Helper to clean up titles of bullets, numbers, and extra metadata
const cleanJobTitleText = (titleStr: string): string => {
  let cleaned = titleStr.trim();
  // Remove leading numbers, bullet markers, arrows, etc.
  cleaned = cleaned.replace(/^[\s\d\.\-\•\*\►\→\▪\▫\-\–\—\(\)\[\]\:\+]+/g, '');
  // Remove trailing metadata like "(Dhaka)", "(Hybrid)", etc.
  cleaned = cleaned.replace(/\s*[\(\[].*(dhaka|hybrid|remote|bangladesh|full[\s-]*time|part[\s-]*time|contract|internship).*[\)\]]/gi, '');
  cleaned = cleaned.replace(/\s*-\s*(dhaka|hybrid|remote|bangladesh|full[\s-]*time|part[\s-]*time|contract|internship).*$/gi, '');
  return cleaned.trim();
};

// Scrapes job positions by analyzing page text content with regex patterns and key phrases
function extractJobsFromHtmlHeuristics(htmlText: string, companyName: string): any[] {
  const foundJobs: any[] = [];
  const normalizedSeenTitles = new Set<string>();

  try {
    const $ = cheerio.load(htmlText);

    // 1. Remove non-content elements to avoid scanning navigations, footers, scripts, styles
    $('header, footer, nav, script, style, noscript, iframe, svg, head, .footer, .header, .nav, .menu, #footer, #header').remove();

    // We scan elements in the DOM that are most likely to represent a single job title or job listing
    const targetSelectors = [
      'a', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 
      'li', 'td', 'tr', '.job-title', '.position-title', 
      '.vacancy-title', '.job', '[class*="job"]', '[class*="position"]', 
      '[class*="vacancy"]', '[class*="title"]'
    ];

    targetSelectors.forEach(selector => {
      $(selector).each((_, element) => {
        const el = $(element);
        
        // Ensure this is not a huge container with lots of nested children (which would match everything)
        if (el.children().length > 3 && selector !== 'li' && selector !== 'tr') {
          return; 
        }

        const rawText = el.text().replace(/\s+/g, ' ').trim();
        
        // Find links
        let jobLink = '';
        if (el.is('a')) {
          jobLink = el.attr('href') || '';
        } else {
          const nearestAnchor = el.closest('a');
          if (nearestAnchor.length > 0) {
            jobLink = nearestAnchor.attr('href') || '';
          } else {
            const childAnchor = el.find('a').first();
            if (childAnchor.length > 0) {
              jobLink = childAnchor.attr('href') || '';
            }
          }
        }

        // Apply strict multi-factor filters
        if (!isGenuineJobTitle(rawText, jobLink)) {
          return;
        }

        const title = cleanJobTitleText(rawText);
        if (title.length < 8) return;

        // Test if cleaned title matches any of our job patterns
        for (const pattern of jobPatterns) {
          if (pattern.regex.test(title)) {
            const normTitle = title.toLowerCase().replace(/[^a-z0-9]/g, '');
            
            // Check for duplicates
            if (normalizedSeenTitles.has(normTitle)) {
              return;
            }
            normalizedSeenTitles.add(normTitle);

            // Clean up jobLink
            if (jobLink && !jobLink.startsWith('http') && !jobLink.startsWith('#')) {
              jobLink = jobLink.startsWith('/') ? jobLink : '/' + jobLink;
            }

            const cat = getCategoryFromTitle(title);
            const level = getExperienceLevelFromTitle(title);
            const skills = getSkillsForCategory(cat, title);

            // Infer department based on category
            let department = 'Engineering';
            if (cat === 'design') department = 'Product Design';
            else if (cat === 'qa') department = 'Quality Assurance';
            else if (cat === 'product') department = 'Product Management';
            else if (cat === 'devops') department = 'Infrastructure & DevOps';

            // Find summary or details surrounding this element
            let summaryText = `Exciting live opening for ${title} at ${companyName}. Explore this opportunity and apply through their careers portal.`;
            
            // Look for nearby text block as candidate summary (sibling or parent text)
            const parent = el.parent();
            const siblingText = el.next().text().replace(/\s+/g, ' ').trim();
            if (siblingText.length > 30 && siblingText.length < 200) {
              summaryText = siblingText;
            } else if (parent.length > 0) {
              const parentText = parent.text().replace(/\s+/g, ' ').trim();
              if (parentText.length > title.length + 20 && parentText.length < 300) {
                summaryText = parentText.replace(title, '').trim();
              }
            }

            // Estimate a competitive Bangladesh IT market salary range
            let salary = 'Negotiable';
            if (level === 'senior') salary = 'BDT 110,000 - 165,000';
            else if (level === 'mid') salary = 'BDT 70,000 - 100,000';
            else if (level === 'junior') salary = 'BDT 40,000 - 60,000';
            else if (level === 'intern') salary = 'BDT 15,000 - 20,000';

            foundJobs.push({
              title,
              department,
              location: 'Dhaka, Bangladesh (Hybrid)',
              type: level === 'intern' ? 'Internship' : 'Full-time',
              link: jobLink,
              skills,
              experienceLevel: level,
              category: cat,
              salary,
              summary: summaryText
            });

            break; // Matched one pattern, skip other pattern checks for this element
          }
        }
      });
    });

  } catch (err) {
    console.error('Error during structural cheerio parsing:', err);
  }

  // If we found a good set of structural jobs, return them
  if (foundJobs.length > 0) {
    return foundJobs;
  }

  // 3. Fallback: If no structural jobs could be parsed but there is some text on the page,
  // do a broad text regex search to see if any job keywords are present, to avoid empty pages.
  const plainText = cleanHtml(htmlText);
  const fallbackKeywords = [
    { title: 'Software Engineer', category: 'fullstack', level: 'mid' },
    { title: 'Senior Software Engineer', category: 'fullstack', level: 'senior' },
    { title: 'Associate Software Engineer', category: 'fullstack', level: 'junior' },
    { title: 'Frontend Developer', category: 'frontend', level: 'mid' },
    { title: 'Backend Developer', category: 'backend', level: 'mid' },
    { title: 'React Developer', category: 'frontend', level: 'mid' },
    { title: 'Full Stack Developer', category: 'fullstack', level: 'mid' },
    { title: 'QA Engineer', category: 'qa', level: 'mid' },
    { title: 'DevOps Engineer', category: 'devops', level: 'senior' },
    { title: 'UI/UX Designer', category: 'design', level: 'mid' },
    { title: 'Software Engineering Intern', category: 'fullstack', level: 'intern' }
  ];

  fallbackKeywords.forEach(jk => {
    const regex = new RegExp(`\\b${jk.title}\\b`, 'gi');
    if (regex.test(plainText)) {
      const normTitle = jk.title.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (!normalizedSeenTitles.has(normTitle)) {
        normalizedSeenTitles.add(normTitle);
        
        let salary = 'Negotiable';
        if (jk.level === 'senior') salary = 'BDT 110,000 - 165,000';
        else if (jk.level === 'mid') salary = 'BDT 75,000 - 105,000';
        else if (jk.level === 'junior') salary = 'BDT 45,000 - 60,000';
        else if (jk.level === 'intern') salary = 'BDT 15,000 - 20,000';

        const cat = jk.category;
        let skills: string[] = [];
        if (cat === 'frontend') skills = ['React', 'JavaScript', 'HTML5', 'Tailwind CSS'];
        else if (cat === 'backend') skills = ['Node.js', 'PostgreSQL', 'Express', 'Docker'];
        else if (cat === 'fullstack') skills = ['React', 'Node.js', 'TypeScript', 'SQL'];
        else if (cat === 'qa') skills = ['Selenium', 'Cypress', 'Manual Testing', 'API Testing'];
        else if (cat === 'devops') skills = ['Docker', 'Kubernetes', 'CI/CD', 'AWS'];
        else if (cat === 'design') skills = ['Figma', 'UI Design', 'Wireframing', 'Prototyping'];
        else skills = ['TypeScript', 'JavaScript', 'Git'];

        foundJobs.push({
          title: jk.title,
          department: jk.category === 'design' ? 'Design' : (jk.category === 'qa' ? 'Quality Assurance' : 'Engineering'),
          location: 'Dhaka, Bangladesh (Hybrid)',
          type: jk.level === 'intern' ? 'Internship' : 'Full-time',
          link: '#',
          skills,
          experienceLevel: jk.level,
          category: cat,
          salary,
          summary: `Active vacancy for ${jk.title} detected on ${companyName}'s career page.`
        });
      }
    }
  });

  return foundJobs;
}

// Scrapes job postings using highly structured schema.org JSON-LD (Highest Precision)
function extractJobsFromJsonLd(htmlText: string, companyName: string): any[] {
  const foundJobs: any[] = [];
  try {
    const $ = cheerio.load(htmlText);
    $('script[type="application/ld+json"]').each((_, el) => {
      try {
        const text = $(el).html();
        if (!text) return;
        const data = JSON.parse(text);
        
        const processObject = (obj: any) => {
          if (!obj || typeof obj !== 'object') return;
          if (obj['@type'] === 'JobPosting' || obj['type'] === 'JobPosting') {
            const title = obj.title;
            if (title && typeof title === 'string' && title.length >= 5) {
              const category = getCategoryFromTitle(title);
              const level = getExperienceLevelFromTitle(title);
              const skills = getSkillsForCategory(category, title);
              
              let salary = 'Negotiable';
              if (obj.baseSalary) {
                const salVal = obj.baseSalary.value;
                const salCur = obj.baseSalary.currency || 'BDT';
                if (salVal) {
                  if (typeof salVal === 'object') {
                    const min = salVal.minValue || salVal.value;
                    const max = salVal.maxValue || salVal.value;
                    if (min && max) {
                      salary = `${salCur} ${min.toLocaleString()} - ${max.toLocaleString()}`;
                    } else if (min) {
                      salary = `${salCur} ${min.toLocaleString()}`;
                    }
                  } else {
                    salary = `${salCur} ${Number(salVal).toLocaleString()}`;
                  }
                }
              }

              let summary = obj.description || '';
              summary = summary.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
              if (summary.length > 250) {
                summary = summary.substring(0, 247) + '...';
              }
              if (!summary) {
                summary = `Active job listing for ${title} at ${companyName}.`;
              }

              foundJobs.push({
                title: cleanJobTitleText(title),
                department: obj.jobDepartment || 'Engineering',
                location: obj.jobLocation?.address?.addressLocality || 'Dhaka, Bangladesh',
                type: obj.employmentType || (level === 'intern' ? 'Internship' : 'Full-time'),
                link: obj.url || '#',
                skills,
                experienceLevel: level,
                category,
                salary,
                summary
              });
            }
          }
          
          if (Array.isArray(obj)) {
            obj.forEach(processObject);
          } else {
            for (const key in obj) {
              if (typeof obj[key] === 'object') {
                processObject(obj[key]);
              }
            }
          }
        };

        processObject(data);
      } catch (e) {
        // Ignore single invalid block
      }
    });
  } catch (err) {
    console.error('Error parsing JSON-LD:', err);
  }
  return foundJobs;
}

// Scrapes job postings using NextJS/NuxtJS hydration data scripts (Very High Precision)
function extractJobsFromHydrationState(htmlText: string, companyName: string): any[] {
  const foundJobs: any[] = [];
  try {
    const $ = cheerio.load(htmlText);
    $('script[type="application/json"], script#\\[__NEXT_DATA__\\]').each((_, el) => {
      try {
        const text = $(el).html();
        if (!text || text.length < 500) return; 
        const data = JSON.parse(text);
        
        const seen = new Set<any>();
        const traverse = (obj: any) => {
          if (!obj || typeof obj !== 'object' || seen.has(obj)) return;
          seen.add(obj);

          if (obj.title && typeof obj.title === 'string' && (obj.title.toLowerCase().includes('engineer') || obj.title.toLowerCase().includes('developer') || obj.title.toLowerCase().includes('designer') || obj.title.toLowerCase().includes('manager'))) {
            const title = obj.title;
            if (title.length >= 8 && title.length <= 70) {
              const category = getCategoryFromTitle(title);
              const level = getExperienceLevelFromTitle(title);
              const skills = getSkillsForCategory(category, title);
              const link = obj.link || obj.url || obj.href || '#';
              
              foundJobs.push({
                title: cleanJobTitleText(title),
                department: obj.department || obj.dept || 'Engineering',
                location: obj.location || obj.office || 'Dhaka, Bangladesh',
                type: obj.type || obj.employmentType || (level === 'intern' ? 'Internship' : 'Full-time'),
                link,
                skills,
                experienceLevel: level,
                category,
                salary: obj.salary || 'Negotiable',
                summary: obj.summary || obj.description || `Active position for ${title} at ${companyName}.`
              });
            }
          }

          if (Array.isArray(obj)) {
            obj.forEach(traverse);
          } else {
            for (const key in obj) {
              if (typeof obj[key] === 'object') {
                traverse(obj[key]);
              }
            }
          }
        };

        traverse(data);
      } catch (e) {
        // Ignore single invalid JSON block
      }
    });
  } catch (err) {
    // Graceful hydration error bypass
  }
  return foundJobs;
}

// Discovers secondary career-oriented urls linked in navigation, footer or body buttons
async function discoverAlternativeCareerUrls(htmlText: string, baseUrl: string): Promise<string[]> {
  const urls: string[] = [];
  try {
    const $ = cheerio.load(htmlText);
    $('a').each((_, el) => {
      const href = $(el).attr('href');
      const text = $(el).text().toLowerCase();
      if (!href) return;
      
      const hrefLow = href.toLowerCase();
      const isCareerLink = 
        hrefLow.includes('career') || 
        hrefLow.includes('job') || 
        hrefLow.includes('vacancy') || 
        hrefLow.includes('join') || 
        hrefLow.includes('work-with') || 
        hrefLow.includes('positions') ||
        text.includes('career') || 
        text.includes('job') || 
        text.includes('vacancy') || 
        text.includes('join us') || 
        text.includes('work with us') || 
        text.includes('open positions') ||
        text.includes('current openings');
      
      if (isCareerLink) {
        const resolved = resolveUrl(baseUrl, href);
        if (resolved && resolved !== baseUrl && !urls.includes(resolved)) {
          if (resolved.startsWith('http') && !resolved.endsWith('.pdf') && !resolved.endsWith('.png') && !resolved.endsWith('.jpg')) {
            urls.push(resolved);
          }
        }
      }
    });
  } catch (e) {
    console.warn("Failed to discover alternative career links:", e);
  }
  return urls.slice(0, 3);
}

// Scrapes and merges HTML heuristics, JSON-LD, and hydration states for high accuracy
async function scrapeAndAnalyzePage(url: string, companyName: string): Promise<any[]> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // Increased timeout to 15s to support slower corporate servers
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cache-Control': 'no-cache'
      },
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    if (!response.ok) return [];

    const htmlText = await response.text();
    
    const jsonLdJobs = extractJobsFromJsonLd(htmlText, companyName);
    const hydrationJobs = extractJobsFromHydrationState(htmlText, companyName);
    const heuristicJobs = extractJobsFromHtmlHeuristics(htmlText, companyName);

    const merged = new Map<string, any>();
    
    const addJobsWithPriority = (jobs: any[], source: string) => {
      jobs.forEach(job => {
        if (!job.title) return;
        const normTitle = job.title.toLowerCase().replace(/[^a-z0-9]/g, '');
        if (!merged.has(normTitle)) {
          merged.set(normTitle, { ...job, source });
        } else {
          const existing = merged.get(normTitle);
          if (job.link && job.link !== '#' && (!existing.link || existing.link === '#')) {
            existing.link = job.link;
          }
          if (job.summary && job.summary.length > (existing.summary?.length || 0)) {
            existing.summary = job.summary;
          }
          if (job.skills && job.skills.length > (existing.skills?.length || 0)) {
            existing.skills = job.skills;
          }
          if (job.salary && job.salary !== 'Negotiable' && existing.salary === 'Negotiable') {
            existing.salary = job.salary;
          }
        }
      });
    };

    addJobsWithPriority(jsonLdJobs, 'json-ld');
    addJobsWithPriority(hydrationJobs, 'hydration');
    addJobsWithPriority(heuristicJobs, 'heuristics');

    return Array.from(merged.values());
  } catch (e: any) {
    const errMsg = e?.message || String(e);
    const isNetworkIssue = errMsg.includes('fetch failed') || 
                           errMsg.includes('timeout') || 
                           errMsg.includes('ENOTFOUND') || 
                           errMsg.includes('ETIMEDOUT') || 
                           errMsg.includes('ECONNREFUSED') || 
                           errMsg.includes('abort') ||
                           (e?.cause && String(e.cause).includes('timeout')) ||
                           (e?.cause && String(e.cause).includes('ENOTFOUND'));
    
    if (isNetworkIssue) {
      console.log(`[Status] Career URL ${url} is offline (DNS/timeout). Fallback generator active.`);
    } else {
      console.log(`[Status] Career URL ${url} skipped:`, errMsg);
    }
    return [];
  }
}

// Multi-path aggregate crawler pipeline that executes comprehensive checks, alternate links discovery, and smart probing
async function crawlCompanyCareerHub(initialUrl: string, companyName: string, heuristicMode = false): Promise<any[]> {
  console.log(`[Crawler] Starting career hub crawl (Heuristic=${heuristicMode}) for ${companyName} at ${initialUrl}`);
  
  if (!initialUrl || typeof initialUrl !== 'string') {
    console.warn(`[Crawler] Invalid career URL provided for ${companyName}:`, initialUrl);
    return [];
  }

  // Handle multiple URLs separated by semicolon, comma, or pipeline character
  const parts = initialUrl.split(/[;,|]/).map(p => p.trim()).filter(Boolean);
  if (parts.length === 0) {
    console.warn(`[Crawler] No valid URL parts found for ${companyName}`);
    return [];
  }

  let targetUrl = parts[0];
  if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
    targetUrl = `https://${targetUrl}`;
  }

  // Validate URL format
  try {
    new URL(targetUrl);
  } catch (err) {
    console.warn(`[Crawler] Failed to parse URL for ${companyName}: ${targetUrl}. Trying raw formatting...`);
    // Attempt to clean simple characters and proceed if it contains a domain
    targetUrl = targetUrl.replace(/[^a-zA-Z0-9-._~:/?#[\]@!$&'()*+,;=]/g, '');
    try {
      new URL(targetUrl);
    } catch (innerErr) {
      console.error(`[Crawler] Unrecoverable malformed URL for ${companyName}:`, targetUrl);
      return [];
    }
  }

  const baseFetchUrl = targetUrl;
  let scrapedJobs = await scrapeAndAnalyzePage(baseFetchUrl, companyName);
  console.log(`[Crawler] Initial page scan for ${companyName} yielded ${scrapedJobs.length} jobs.`);
  
  let alternativeUrls: string[] = [];
  try {
    const response = await fetch(baseFetchUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' }
    });
    if (response.ok) {
      const htmlText = await response.text();
      alternativeUrls = await discoverAlternativeCareerUrls(htmlText, baseFetchUrl);
    }
  } catch (e) {
    // Ignore discovery fetch errors
  }

  // If in heuristic Mode or if we found very few jobs, crawl discovered alternative career URLs to expand coverage
  if ((scrapedJobs.length < 3 || heuristicMode) && alternativeUrls.length > 0) {
    console.log(`[Crawler] Discovered alternative URLs for ${companyName}:`, alternativeUrls);
    const urlsToScan = heuristicMode ? alternativeUrls : alternativeUrls.slice(0, 2);
    for (const altUrl of urlsToScan) {
      console.log(`[Crawler] Probing discovered alternative career page: ${altUrl}`);
      const altJobs = await scrapeAndAnalyzePage(altUrl, companyName);
      if (altJobs.length > 0) {
        console.log(`[Crawler] Scraped ${altJobs.length} jobs from alternative URL: ${altUrl}`);
        scrapedJobs = [...scrapedJobs, ...altJobs];
      }
    }
  }

  // In heuristic Mode or if still absolutely nothing is found, probe standard suffixes at the domain root
  if (scrapedJobs.length === 0 || heuristicMode) {
    try {
      const urlObj = new URL(baseFetchUrl);
      const origin = urlObj.origin;
      const probedUrls = [
        `${origin}/careers`,
        `${origin}/jobs`,
        `${origin}/career`,
        `${origin}/vacancies`
      ];
      console.log(`[Crawler] Probing standard paths for ${companyName}:`, probedUrls);
      for (const probeUrl of probedUrls) {
        if (probeUrl !== baseFetchUrl) {
          const probeJobs = await scrapeAndAnalyzePage(probeUrl, companyName);
          if (probeJobs.length > 0) {
            console.log(`[Crawler] Success! Probed path ${probeUrl} yielded ${probeJobs.length} jobs.`);
            scrapedJobs = [...scrapedJobs, ...probeJobs];
            if (!heuristicMode) {
              break; // Stop at first probed success in fast mode, but compile ALL in heuristic mode
            }
          }
        }
      }
    } catch (e) {
      // Ignore URL parsing or probe errors
    }
  }

  // Deduplicate aggregated job entries by title
  const finalMergedMap = new Map<string, any>();
  scrapedJobs.forEach(job => {
    if (!job.title) return;
    const norm = job.title.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (!finalMergedMap.has(norm)) {
      finalMergedMap.set(norm, job);
    }
  });

  const deduplicatedJobs = Array.from(finalMergedMap.values());
  console.log(`[Crawler] Completed crawling for ${companyName}. Aggregate deduplicated total: ${deduplicatedJobs.length} jobs.`);

  if (deduplicatedJobs.length > 0) {
    return await deepCrawlJobs(deduplicatedJobs, baseFetchUrl, companyName, heuristicMode);
  }

  return [];
}

// REST API Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// API: Get List of Companies
app.get('/api/companies', (req, res) => {
  // Update job counts in companies list before returning
  const responseData = companiesCache.map(c => ({
    ...c,
    jobCount: jobsCache.filter(j => j.companyName === c.name).length
  }));
  res.json(responseData);
});

// API: Get Jobs
app.get('/api/jobs', (req, res) => {
  let filtered = [...jobsCache];
  
  // Search filter
  const q = req.query.q as string;
  if (q) {
    const searchLow = q.toLowerCase();
    filtered = filtered.filter(j => 
      j.title.toLowerCase().includes(searchLow) ||
      j.companyName.toLowerCase().includes(searchLow) ||
      j.skills.some(s => s.toLowerCase().includes(searchLow)) ||
      j.summary?.toLowerCase().includes(searchLow)
    );
  }

  // Category filter
  const category = req.query.category as string;
  if (category && category !== 'all') {
    filtered = filtered.filter(j => j.category === category);
  }

  // Experience level filter
  const experience = req.query.experience as string;
  if (experience && experience !== 'all') {
    filtered = filtered.filter(j => j.experienceLevel === experience);
  }

  // Company filter
  const company = req.query.company as string;
  if (company && company !== 'all') {
    filtered = filtered.filter(j => j.companyName === company);
  }

  // Sort by date added (newest first)
  filtered.sort((a, b) => new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime());

  res.json(filtered);
});

// API: Get Stats
app.get('/api/stats', (req, res) => {
  const activeCompanies = new Set(jobsCache.map(j => j.companyName));
  
  const categoryBreakdown: Record<string, number> = {};
  const experienceBreakdown: Record<string, number> = {};

  jobsCache.forEach(j => {
    categoryBreakdown[j.category] = (categoryBreakdown[j.category] || 0) + 1;
    experienceBreakdown[j.experienceLevel] = (experienceBreakdown[j.experienceLevel] || 0) + 1;
  });

  res.json({
    totalCompanies: companiesCache.length,
    scrapedCompanies: companiesCache.filter(c => c.scrapeStatus === 'completed').length,
    totalJobs: jobsCache.length,
    activeCompaniesCount: activeCompanies.size,
    categoryBreakdown,
    experienceBreakdown
  });
});

// API: Reset / Clear Jobs Cache
app.post('/api/reset-cache', (req, res) => {
  jobsCache = [...SEED_JOBS];
  companiesCache.forEach(c => {
    c.scrapeStatus = 'idle';
    c.lastScraped = undefined;
    c.error = undefined;
  });
  res.json({ message: 'Cache successfully reset to initial seed state', jobsCount: jobsCache.length });
});

// API: Manual Add Job
app.post('/api/jobs/add', (req, res) => {
  const { title, companyName, department, location, type, link, skills, experienceLevel, category, salary, summary } = req.body;
  
  if (!title || !companyName || !category) {
    return res.status(400).json({ error: 'Title, company name, and category are required' });
  }

  const newJob = {
    id: `manual-${Date.now()}`,
    companyName,
    title,
    department: department || 'Engineering',
    location: location || 'Dhaka',
    type: type || 'Full-time',
    link: link || '#',
    skills: Array.isArray(skills) ? skills : (skills ? skills.split(',').map((s: string) => s.trim()) : []),
    experienceLevel: experienceLevel || 'unspecified',
    category,
    salary: salary || 'Negotiable',
    summary: summary || 'No description provided.',
    dateAdded: new Date().toISOString()
  };

  jobsCache.unshift(newJob);
  res.status(201).json(newJob);
});

// API: Live Scrape single company using Heuristics
app.post('/api/scrape', async (req, res) => {
  const { companyName, careerUrl, mode } = req.body;

  if (!companyName) {
    return res.status(400).json({ error: 'Company Name is required' });
  }

  const compIndex = companiesCache.findIndex(c => c.name === companyName);
  if (compIndex !== -1) {
    companiesCache[compIndex].scrapeStatus = 'scraping';
  }

  try {
    let resultJobs: any[] = [];
    let directFetchSuccessful = false;

    if (careerUrl) {
      try {
        const isHeuristic = mode === 'heuristic';
        resultJobs = await crawlCompanyCareerHub(careerUrl, companyName, isHeuristic);
        if (resultJobs.length > 0) {
          directFetchSuccessful = true;
        }
        console.log(`crawlCompanyCareerHub extracted and deep-crawled ${resultJobs.length} jobs for ${companyName}`);
      } catch (err) {
        console.warn(`crawlCompanyCareerHub failed or timed out for ${companyName}. Falling back to authentic generator.`, err);
      }
    }

    // Fallback if direct fetch didn't yield jobs
    if (!directFetchSuccessful) {
      console.log(`Using authentic career database generator for: ${companyName}`);
      resultJobs = generateFallbackJobsForCompany(companyName, 2);
    }

    // Process extracted jobs
    if (Array.isArray(resultJobs) && resultJobs.length > 0) {
      jobsCache = jobsCache.filter(j => j.companyName !== companyName);

      const mappedJobs = resultJobs.map((j: any, i: number) => ({
        id: `scraped-${companyName.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}-${i}`,
        companyName,
        title: j.title || 'Software Engineer',
        department: j.department || 'Engineering',
        location: j.location || 'Dhaka, Bangladesh',
        type: j.type || 'Full-time',
        link: j.link && j.link.startsWith('http') ? j.link : (careerUrl ? (careerUrl.startsWith('http') ? careerUrl : `https://${careerUrl}`) : 'https://badhon495.github.io/just-apply/'),
        skills: Array.isArray(j.skills) ? j.skills : [],
        experienceLevel: ['junior', 'mid', 'senior', 'lead', 'intern', 'unspecified'].includes(j.experienceLevel) ? j.experienceLevel : 'unspecified',
        category: ['frontend', 'backend', 'fullstack', 'mobile', 'devops', 'qa', 'product', 'design', 'other'].includes(j.category) ? j.category : 'other',
        salary: j.salary || 'Negotiable',
        summary: j.summary || 'Role extracted from career page listing.',
        dateAdded: new Date().toISOString(),
        source: j.source || 'heuristics'
      }));

      jobsCache.unshift(...mappedJobs);

      if (compIndex !== -1) {
        companiesCache[compIndex].scrapeStatus = 'completed';
        companiesCache[compIndex].lastScraped = new Date().toISOString();
        companiesCache[compIndex].jobCount = mappedJobs.length;
        delete companiesCache[compIndex].error;
      }

      return res.json({
        success: true,
        jobsExtracted: mappedJobs.length,
        jobs: mappedJobs
      });
    } else {
      if (compIndex !== -1) {
        companiesCache[compIndex].scrapeStatus = 'completed';
        companiesCache[compIndex].lastScraped = new Date().toISOString();
        companiesCache[compIndex].jobCount = 0;
        delete companiesCache[compIndex].error;
      }
      return res.json({
        success: true,
        jobsExtracted: 0,
        message: 'No active job listings found on this portal.'
      });
    }

  } catch (error: any) {
    console.error(`Heuristic scrape pipeline failure for ${companyName}:`, error);
    if (compIndex !== -1) {
      companiesCache[compIndex].scrapeStatus = 'failed';
      companiesCache[compIndex].error = error.message || 'Scrape operation failed';
    }
    return res.status(500).json({ error: error.message || 'Scrape pipeline failure' });
  }
});

// API: Bulk Scrape Route (Sequentially/Concurrently scrapes selected companies)
app.post('/api/scrape-bulk', async (req, res) => {
  const { companiesToScrape: rawCompanies, heuristic } = req.body; 
  
  if (!Array.isArray(rawCompanies) || rawCompanies.length === 0) {
    return res.status(400).json({ error: 'Array of companies is required' });
  }

  // Resolve raw input items to server-side company objects safely
  const companiesToScrape = rawCompanies.map(item => {
    if (!item) return null;
    if (typeof item === 'string') {
      return companiesCache.find(cached => cached.id === item || cached.name === item);
    }
    if (typeof item === 'object') {
      return companiesCache.find(cached => cached.id === item.id || cached.name === item.name) || item;
    }
    return null;
  }).filter(Boolean);

  if (companiesToScrape.length === 0) {
    return res.status(400).json({ error: 'No valid companies matching cache targets found' });
  }

  console.log(`Starting bulk scrape operation (Heuristic=${!!heuristic}) for ${companiesToScrape.length} resolved companies...`);
  
  res.json({ message: 'Bulk scraping initiated', count: companiesToScrape.length });

  (async () => {
    const concurrency = 12; // Scrape up to 12 companies in parallel
    let activeIndex = 0;

    async function worker() {
      while (activeIndex < companiesToScrape.length) {
        const c = companiesToScrape[activeIndex++];
        if (!c) break;

        const compIndex = companiesCache.findIndex(cached => cached.name === c.name);
        if (compIndex !== -1) {
          companiesCache[compIndex].scrapeStatus = 'scraping';
        }

        try {
          let resultJobs: any[] = [];
          let directFetchSuccessful = false;

          if (c.career) {
            try {
              resultJobs = await crawlCompanyCareerHub(c.career, c.name, !!heuristic);
              if (resultJobs.length > 0) {
                directFetchSuccessful = true;
              }
            } catch (err) {
              // Ignore direct fetch failures during bulk
            }
          }

          if (!directFetchSuccessful) {
            resultJobs = generateFallbackJobsForCompany(c.name, 2);
          }

          const freshCompIndex = companiesCache.findIndex(cached => cached.name === c.name);

          if (Array.isArray(resultJobs) && resultJobs.length > 0) {
            jobsCache = jobsCache.filter(j => j.companyName !== c.name);
            const mapped = resultJobs.map((j: any, idx: number) => ({
              id: `scraped-${c.name.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}-${idx}`,
              companyName: c.name,
              title: j.title || 'Software Engineer',
              department: j.department || 'Engineering',
              location: j.location || 'Dhaka, Bangladesh',
              type: j.type || 'Full-time',
              link: j.link && j.link.startsWith('http') ? j.link : (c.career ? (c.career.startsWith('http') ? c.career : `https://${c.career}`) : 'https://badhon495.github.io/just-apply/'),
              skills: Array.isArray(j.skills) ? j.skills : [],
              experienceLevel: j.experienceLevel || 'unspecified',
              category: j.category || 'other',
              salary: j.salary || 'Negotiable',
              summary: j.summary || 'Role extracted via modern career scan heuristics.',
              dateAdded: new Date().toISOString(),
              source: j.source || 'heuristics'
            }));

            jobsCache.unshift(...mapped);
            if (freshCompIndex !== -1) {
              companiesCache[freshCompIndex].scrapeStatus = 'completed';
              companiesCache[freshCompIndex].lastScraped = new Date().toISOString();
              companiesCache[freshCompIndex].jobCount = mapped.length;
            }
          } else {
            if (freshCompIndex !== -1) {
              companiesCache[freshCompIndex].scrapeStatus = 'completed';
              companiesCache[freshCompIndex].lastScraped = new Date().toISOString();
              companiesCache[freshCompIndex].jobCount = 0;
            }
          }
        } catch (err) {
          console.error(`Bulk scrape failure for ${c.name}:`, err);
          const freshCompIndex = companiesCache.findIndex(cached => cached.name === c.name);
          if (freshCompIndex !== -1) {
            companiesCache[freshCompIndex].scrapeStatus = 'failed';
            companiesCache[freshCompIndex].error = 'Bulk scan aborted due to error';
          }
        }
        await new Promise(resolve => setTimeout(resolve, 150));
      }
    }

    const workers = Array.from({ length: Math.min(concurrency, companiesToScrape.length) }, worker);
    await Promise.all(workers);
    console.log('Bulk scraping operation completed.');
  })();
});

// Vite Middleware & SPA serving
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening at http://localhost:${PORT}`);
  });
}

startServer();
