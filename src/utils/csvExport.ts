import { Job } from '../types';

export function generateJobsCsv(jobs: Job[]): string {
  const headers = [
    'Job ID',
    'Job Title',
    'Company Name',
    'Category',
    'Experience Level',
    'Work Mode / Type',
    'Location',
    'Salary',
    'Required Skills',
    'Career / Apply Link',
    'Summary'
  ];

  const escapeCsv = (val: any) => {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const rows = jobs.map(j => [
    j.id,
    j.title,
    j.companyName,
    j.category,
    j.experienceLevel,
    j.type || 'Full-time',
    j.location || 'Dhaka, Bangladesh',
    j.salary || 'Negotiable',
    Array.isArray(j.skills) ? j.skills.join('; ') : '',
    j.link,
    (j.summary || '').replace(/[\r\n]+/g, ' ')
  ]);

  const csvContent = [
    headers.map(escapeCsv).join(','),
    ...rows.map(row => row.map(escapeCsv).join(','))
  ].join('\r\n');

  return csvContent;
}

export function downloadJobsCsv(jobs: Job[], filename = 'scraped_tech_jobs.csv') {
  const csvStr = generateJobsCsv(jobs);
  const blob = new Blob([csvStr], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
