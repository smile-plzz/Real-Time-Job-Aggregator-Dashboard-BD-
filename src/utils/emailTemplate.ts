/**
 * Modern Minimalistic HTML Email Template Generator
 * Designed for maximum email client compatibility (Gmail, Outlook, Apple Mail)
 */

export interface EmailTemplateOptions {
  jobs: Array<{
    id: string;
    companyName: string;
    title: string;
    department?: string;
    location?: string;
    type?: string;
    link: string;
    skills?: string[];
    experienceLevel?: string;
    category?: string;
    salary?: string;
    summary?: string;
    source?: string;
  }>;
  recipientEmail: string;
  theme?: 'modern-indigo' | 'minimal-dark' | 'emerald-clean' | 'royal-violet';
  filterSummary?: string;
  isFallback?: boolean;
  unsubscribeUrl?: string;
  managePrefsUrl?: string;
}

export function generateEmailHtml(options: EmailTemplateOptions): string {
  const {
    jobs,
    recipientEmail,
    theme = 'modern-indigo',
    filterSummary = 'Curated Active Openings',
    isFallback = false,
    unsubscribeUrl = 'https://real-time-job-aggregator-dashboard-bd.onrender.com/#digest',
    managePrefsUrl = 'https://real-time-job-aggregator-dashboard-bd.onrender.com/#digest'
  } = options;

  const dateStr = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  // Theme Configs
  const themeStyles = {
    'modern-indigo': {
      bg: '#f8fafc',
      cardBg: '#ffffff',
      cardBorder: '#e2e8f0',
      headerBg: '#4f46e5',
      headerText: '#ffffff',
      titleColor: '#0f172a',
      subColor: '#475569',
      jobTitleColor: '#4338ca',
      btnBg: '#4f46e5',
      btnText: '#ffffff',
      badgeBg: '#e0e7ff',
      badgeText: '#3730a3',
      accentBorder: '#6366f1'
    },
    'minimal-dark': {
      bg: '#0f172a',
      cardBg: '#1e293b',
      cardBorder: '#334155',
      headerBg: '#1e293b',
      headerText: '#f8fafc',
      titleColor: '#f8fafc',
      subColor: '#94a3b8',
      jobTitleColor: '#38bdf8',
      btnBg: '#10b981',
      btnText: '#0f172a',
      badgeBg: '#334155',
      badgeText: '#38bdf8',
      accentBorder: '#10b981'
    },
    'emerald-clean': {
      bg: '#f0fdf4',
      cardBg: '#ffffff',
      cardBorder: '#dcfce7',
      headerBg: '#059669',
      headerText: '#ffffff',
      titleColor: '#064e3b',
      subColor: '#047857',
      jobTitleColor: '#047857',
      btnBg: '#059669',
      btnText: '#ffffff',
      badgeBg: '#dcfce7',
      badgeText: '#15803d',
      accentBorder: '#10b981'
    },
    'royal-violet': {
      bg: '#faf5ff',
      cardBg: '#ffffff',
      cardBorder: '#f3e8ff',
      headerBg: '#6b21a8',
      headerText: '#ffffff',
      titleColor: '#3b0764',
      subColor: '#6b21a8',
      jobTitleColor: '#7e22ce',
      btnBg: '#7e22ce',
      btnText: '#ffffff',
      badgeBg: '#f3e8ff',
      badgeText: '#6b21a8',
      accentBorder: '#a855f7'
    }
  };

  const currentTheme = themeStyles[theme] || themeStyles['modern-indigo'];

  const jobCardsHtml = jobs.length > 0 ? jobs.map(job => {
    const expLabel = (job.experienceLevel || 'MID').toUpperCase();
    const typeLabel = job.type || 'Full-time';
    const locationLabel = job.location || 'Dhaka, Bangladesh';
    const salaryLabel = job.salary && job.salary !== 'Negotiable' ? job.salary : null;
    const skillsList = Array.isArray(job.skills) ? job.skills.slice(0, 4) : [];

    return `
    <div style="background-color: ${currentTheme.cardBg}; border: 1px solid ${currentTheme.cardBorder}; border-left: 4px solid ${currentTheme.accentBorder}; border-radius: 12px; padding: 20px; margin-bottom: 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.03);">
      <table width="100%" cellPadding="0" cellSpacing="0" border="0">
        <tr>
          <td style="vertical-align: top;">
            <a href="${job.link}" target="_blank" style="font-size: 17px; font-weight: 700; color: ${currentTheme.jobTitleColor}; text-decoration: none; display: inline-block; margin-bottom: 6px;">
              ${job.title}
            </a>
            <div style="font-size: 13px; font-weight: 600; color: ${currentTheme.subColor}; margin-bottom: 10px;">
              🏢 ${job.companyName} &nbsp;•&nbsp; 📍 ${locationLabel}
            </div>
          </td>
        </tr>
      </table>

      ${job.summary ? `
        <p style="font-size: 13px; line-height: 1.5; color: ${currentTheme.subColor}; margin: 0 0 12px 0; opacity: 0.95;">
          ${job.summary.length > 180 ? job.summary.substring(0, 180) + '...' : job.summary}
        </p>
      ` : ''}

      ${skillsList.length > 0 ? `
        <div style="margin-bottom: 12px;">
          ${skillsList.map(skill => `
            <span style="display: inline-block; background-color: ${currentTheme.badgeBg}; color: ${currentTheme.badgeText}; font-size: 11px; font-weight: 600; padding: 3px 8px; border-radius: 6px; margin-right: 6px; margin-bottom: 4px;">
              ${skill}
            </span>
          `).join('')}
        </div>
      ` : ''}

      <table width="100%" cellPadding="0" cellSpacing="0" border="0" style="margin-top: 12px; padding-top: 12px; border-top: 1px dashed ${currentTheme.cardBorder};">
        <tr>
          <td style="vertical-align: middle;">
            <span style="display: inline-block; background-color: ${currentTheme.badgeBg}; color: ${currentTheme.badgeText}; font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 9999px; margin-right: 6px;">
              ${typeLabel}
            </span>
            <span style="display: inline-block; background-color: #f1f5f9; color: #334155; font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 9999px; margin-right: 6px;">
              ${expLabel}
            </span>
            ${salaryLabel ? `
              <span style="display: inline-block; background-color: #fef3c7; color: #92400e; font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 9999px;">
                💵 ${salaryLabel}
              </span>
            ` : ''}
          </td>
          <td align="right" style="vertical-align: middle;">
            <a href="${job.link}" target="_blank" style="display: inline-block; background-color: ${currentTheme.btnBg}; color: ${currentTheme.btnText}; text-decoration: none; font-size: 12px; font-weight: 700; padding: 8px 16px; border-radius: 8px;">
              Apply Now →
            </a>
          </td>
        </tr>
      </table>
    </div>
    `;
  }).join('') : `
    <div style="text-align: center; padding: 32px; background-color: ${currentTheme.cardBg}; border: 1px border-dashed ${currentTheme.cardBorder}; border-radius: 12px; color: ${currentTheme.subColor};">
      <p style="font-size: 16px; font-weight: 600; margin: 0 0 8px 0;">No matching openings today</p>
      <p style="font-size: 13px; margin: 0;">We'll keep monitoring tech career hubs and email you as soon as new roles open.</p>
    </div>
  `;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Daily BD Tech Job Digest</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: ${currentTheme.bg}; color: ${currentTheme.titleColor};">
  <table width="100%" cellPadding="0" cellSpacing="0" border="0" style="background-color: ${currentTheme.bg}; padding: 24px 12px;">
    <tr>
      <td align="center">
        <table width="100%" cellPadding="0" cellSpacing="0" border="0" style="max-width: 620px; background-color: ${currentTheme.cardBg}; border-radius: 16px; overflow: hidden; border: 1px solid ${currentTheme.cardBorder}; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
          
          <!-- Banner Header -->
          <tr>
            <td style="background-color: ${currentTheme.headerBg}; padding: 28px 24px; text-align: center; color: ${currentTheme.headerText};">
              <div style="font-size: 24px; font-weight: 800; letter-spacing: -0.5px; margin-bottom: 6px;">
                🚀 BD Tech Job Digest
              </div>
              <div style="font-size: 13px; opacity: 0.9; font-weight: 500;">
                ${dateStr} &nbsp;•&nbsp; ${filterSummary}
              </div>
            </td>
          </tr>

          <!-- Context Message -->
          <tr>
            <td style="padding: 24px 24px 12px 24px;">
              <table width="100%" cellPadding="0" cellSpacing="0" border="0" style="background-color: ${currentTheme.bg}; border-radius: 10px; padding: 12px 16px; margin-bottom: 20px;">
                <tr>
                  <td>
                    <span style="font-size: 13px; font-weight: 600; color: ${currentTheme.titleColor};">
                      ${isFallback ? '⚡ No exact filter matches today. Here are today\'s top active tech openings across Bangladesh:' : `🎯 Found <strong>${jobs.length} curated open positions</strong> matching your customized alert criteria:`}
                    </span>
                  </td>
                </tr>
              </table>

              <!-- Job Cards Stream -->
              ${jobCardsHtml}

            </td>
          </tr>

          <!-- Footer Action Banner -->
          <tr>
            <td style="background-color: ${currentTheme.bg}; padding: 20px; text-align: center; border-top: 1px solid ${currentTheme.cardBorder};">
              <a href="${managePrefsUrl}" target="_blank" style="display: inline-block; color: ${currentTheme.jobTitleColor}; font-weight: 700; font-size: 13px; text-decoration: none; margin-bottom: 12px;">
                ⚙️ Update Preferences or Filter Criteria →
              </a>
              <div style="font-size: 11px; color: ${currentTheme.subColor}; line-height: 1.5;">
                Sent to <strong>${recipientEmail}</strong> via BD Tech Hub Automated Scraper Engine.<br/>
                <a href="${unsubscribeUrl}" target="_blank" style="color: ${currentTheme.subColor}; text-decoration: underline;">Unsubscribe from alerts</a>
              </div>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
