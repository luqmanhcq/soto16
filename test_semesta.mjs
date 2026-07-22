import axios from 'axios';
import { wrapper } from 'axios-cookiejar-support';
import { CookieJar } from 'tough-cookie';
import * as cheerio from 'cheerio';
import { writeFileSync } from 'fs';

const LOGIN_PAGE_URL = 'https://semestabangkom.id/member/login?token=fe085afcffe7e43304a9cca3c276b218ea092c2855e5642337d7acd0253aa855c83d687bb991a7bca19c073f2b6fb2e6347049a01ac46429a789501d6fd6618awb39aUL%2BrXcrHGSOFwnzwQ556rBkrt7ohC%2BwKIddWVM%3D';
const LOGIN_API_URL = 'https://semestabangkom.id/member//login/do_login';
const LIST_DATA_URL = 'https://semestabangkom.id/member//monitor_webinar/data_webinar/list_data';
const email = 'luqmanhcq29@gmail.com';
const password = '12345678';

function parseCards(html) {
  const $ = cheerio.load(html);
  const items = [];

  // First try #html_response div (fallback when list_data has no JSON data)
  const htmlResponseEl = $('#html_response');
  if (htmlResponseEl.length > 0) {
    const scopedHtml = htmlResponseEl.html() || '';
    if (scopedHtml.trim().length > 0) {
      const $scoped = cheerio.load(scopedHtml);
      const scopedBoxes = $scoped('.product-box');
      if (scopedBoxes.length > 0) {
        console.log(`Found ${scopedBoxes.length} product boxes inside #html_response`);
        return extractFromBoxes($scoped, $scoped('.product-box'));
      }
    }
  }

  // Primary: parse .product-box elements
  const boxes = $('.product-box');
  console.log('Product boxes found:', boxes.length);
  return extractFromBoxes($, boxes);
}

function extractFromBoxes($, boxes) {
  const items = [];
  boxes.each((_, boxNode) => {
    const box = $(boxNode);
    const details = box.find('.product-details').first();
    const imgDiv = box.find('.product-img').first();
    const title = details.find('h4').first().text().trim();
    const subtitle = details.find('small').first().text().trim();
    const jp = details.find('strong').first().text().trim();
    const badge = details.find('.badge').first().text().trim();
    const timeRange = details.find('label').first().text().trim();
    const link = box.find('a.btn').first().attr('href') || details.find('a[href]').first().attr('href') || '';
    const image = imgDiv.find('img').first().attr('src') || '';

    let dateRange = '';
    const detailsHtml = details.html() || '';
    const hrParts = detailsHtml.split(/<hr\s*\/?>/i);
    if (hrParts.length > 1) {
      const after = hrParts[hrParts.length - 1];
      const m = after.match(/^\s*([\s\S]*?)(?:<label|<|$)/i);
      if (m) dateRange = m[1].replace(/<[^>]+>/g, '').trim();
    }

    const statuses = [];
    imgDiv.find('.ribbon').each((_, r) => {
      const t = $(r).text().trim();
      if (t) statuses.push(t);
    });

    let organizer = '';
    const rawHtml = details.html() || '';
    const m2 = rawHtml.match(/<\/strong>\s*([\s\S]*?)(?:<hr|$)/i);
    if (m2) organizer = m2[1].replace(/<[^>]+>/g, '').trim();

    if (title) {
      items.push({ title, subtitle, jp, badge, dateRange, timeRange, organizer, link, image, status: statuses.join(', ') });
    }
  });
  return items;
}

async function test() {
  const jar = new CookieJar();
  const client = wrapper(axios.create({ jar, withCredentials: true, timeout: 30000 }));

  // Step 1: Visit login page
  console.log('Step 1: Visiting login page...');
  const resGet = await client.get(LOGIN_PAGE_URL);
  console.log('Login page status:', resGet.status);

  // Step 2: POST login
  console.log('Step 2: Logging in...');
  const loginForm = new FormData();
  loginForm.append('email', email);
  loginForm.append('login[password]', password);
  const resPost = await client.post(LOGIN_API_URL, loginForm, { maxRedirects: 5 });
  console.log('Login POST status:', resPost.status);
  const loginData = typeof resPost.data === 'string' ? JSON.parse(resPost.data) : resPost.data;
  console.log('Login response:', JSON.stringify({ status: loginData.status, token: loginData.token ? 'YES' : 'NO', error: loginData.error_login }));
  if (!loginData.status) { console.error('Login FAILED'); return; }
  console.log('Login SUCCESS!');

  const dataToken = loginData.token;

  // Step 3: GET data_webinar page
  const dataPageUrl = `https://semestabangkom.id/member/monitor_webinar/data_webinar?token=${encodeURIComponent(dataToken)}`;
  console.log('Step 3: Fetching data page...');
  const pageRes = await client.get(dataPageUrl, { headers: { Referer: 'https://semestabangkom.id/member/login' } });
  console.log('Data page status:', pageRes.status);

  // Check #html_response in the page HTML
  let pageHtmlResponseLen = 0;
  if (typeof pageRes.data === 'string') {
    const page$ = cheerio.load(pageRes.data);
    const htmlContent = page$('#html_response').html() || '';
    pageHtmlResponseLen = htmlContent.trim().length;
    console.log(`#html_response content length: ${pageHtmlResponseLen}`);
    if (pageHtmlResponseLen > 0) {
      console.log(`#html_response preview: ${htmlContent.slice(0, 200)}`);
    }
  }

  // Step 4: POST to list_data API
  console.log('Step 4: Posting to list_data API...');
  const listForm = new FormData();
  listForm.append('tanggal_awal', '');
  listForm.append('tanggal_akhir', '');
  listForm.append('judul', '');
  const listRes = await client.post(LIST_DATA_URL, listForm, {
    headers: { 'X-Requested-With': 'XMLHttpRequest', 'Referer': dataPageUrl },
    maxRedirects: 5,
  });
  console.log('list_data status:', listRes.status);

  // Parse list_data response
  const listJson = typeof listRes.data === 'string' ? JSON.parse(listRes.data) : listRes.data;
  console.log('list_data JSON status:', listJson.status);

  if (listJson.data && typeof listJson.data === 'string') {
    console.log('list_data HTML length:', listJson.data.length);
    const items = parseCards(listJson.data);
    console.log('\n=== PARSED ITEMS:', items.length, '===');
    items.forEach((item, i) => {
      console.log(`\n[${i + 1}] ${item.title}`);
      console.log(`    Subtitle: ${item.subtitle}`);
      console.log(`    JP: ${item.jp} | Badge: ${item.badge}`);
      console.log(`    Organizer: ${item.organizer}`);
      console.log(`    Date: ${item.dateRange} | Time: ${item.timeRange}`);
      console.log(`    Status: ${item.status}`);
      console.log(`    Link: ${item.link?.slice(0, 80)}...`);
      console.log(`    Image: ${item.image?.slice(0, 80)}...`);
    });

    // Write results to file for verification
    const result = {
      timestamp: new Date().toISOString(),
      loginStatus: resPost.status,
      loginSuccess: loginData.status === true,
      dataPageStatus: pageRes.status,
      htmlResponseLength: pageHtmlResponseLen,
      listDataStatus: listRes.status,
      totalItems: items.length,
      items: items
    };
    writeFileSync('test_result.json', JSON.stringify(result, null, 2), 'utf8');
    console.log('\nResults saved to test_result.json');
  } else {
    console.log('list_data response structure:', Object.keys(listJson));
    console.log('Full response preview:', JSON.stringify(listRes.data).slice(0, 500));

    // Fallback: try parsing #html_response from the data page
    if (typeof pageRes.data === 'string' && pageHtmlResponseLen > 0) {
      console.log('\nFallback: Parsing #html_response from data page...');
      const items = parseCards(pageRes.data);
      console.log(`Parsed from #html_response: ${items.length} items`);
      items.forEach((item, i) => {
        console.log(`\n[${i + 1}] ${item.title}`);
        console.log(`    Subtitle: ${item.subtitle}`);
        console.log(`    JP: ${item.jp} | Badge: ${item.badge}`);
        console.log(`    Organizer: ${item.organizer}`);
        console.log(`    Date: ${item.dateRange} | Time: ${item.timeRange}`);
        console.log(`    Status: ${item.status}`);
      });
      const result = {
        timestamp: new Date().toISOString(),
        source: '#html_response fallback',
        totalItems: items.length,
        items: items
      };
      writeFileSync('test_result.json', JSON.stringify(result, null, 2), 'utf8');
      console.log('\nResults saved to test_result.json');
    }
  }
}

test().catch(console.error);
