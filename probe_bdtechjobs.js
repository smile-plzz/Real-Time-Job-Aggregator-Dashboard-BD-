import * as cheerio from 'cheerio';

async function main() {
  try {
    const res = await fetch('https://www.bdtechjobs.com/', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    console.log('Status:', res.status);
    const html = await res.text();
    console.log('HTML Length:', html.length);
    
    const $ = cheerio.load(html);
    console.log('Page Title:', $('title').text().trim());
    
    // Look for job-related items, headings, links
    console.log('\n--- HEADINGS ---');
    $('h1, h2, h3, h4').slice(0, 15).each((i, el) => {
      console.log(`${el.name} [class="${$(el).attr('class') || ''}"]: ${$(el).text().trim().substring(0, 100)}`);
    });

    console.log('\n--- DETAILED JOB ELEMENTS ---');
    $('a[href^="/jobs/"]').slice(0, 10).each((i, el) => {
      const $el = $(el);
      console.log(`\nJob Link #${i + 1}:`);
      console.log(`  href: ${$el.attr('href')}`);
      console.log(`  Text: ${$el.text().trim().replace(/\s+/g, ' ')}`);
    });

    console.log('\n--- SCRIPT TAGS ---');
    $('script').each((i, el) => {
      const type = $(el).attr('type') || 'none';
      const src = $(el).attr('src') || 'inline';
      const text = $(el).text().trim();
      console.log(`Script #${i + 1}: type="${type}", src="${src}", content_len=${text.length}`);
      if (type === 'application/json' || type === 'application/ld+json' || text.includes('self.__next_f') || text.includes('__NEXT_DATA__')) {
        console.log(`  Preview (first 150 chars): ${text.substring(0, 150)}`);
      }
    });

    console.log('\n--- OTHER BUTTONS AND POTENTIAL CARDS ---');
    $('div[class*="card"], div[class*="item"], div[class*="job"]').slice(0, 10).each((i, el) => {
      console.log(`Element #${i + 1}: tag=${el.name}, class="${$(el).attr('class')}", text="${$(el).text().trim().substring(0, 60)}"`);
    });

  } catch (err) {
    console.error('Error probing:', err);
  }
}

main();
