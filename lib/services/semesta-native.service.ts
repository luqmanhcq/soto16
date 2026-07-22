import * as cheerio from 'cheerio'
import type { CheerioAPI, Cheerio } from 'cheerio'
import { getCache, setCache } from '@/lib/cache/semesta-cache'

// ─── Types ──────────────────────────────────────────────────────────────────

export type SemestaResult = {
  status: 'ok' | 'error'
  http: { loginStatus?: number; dataStatus?: number }
  data?: WebinarItem[]
  sample?: WebinarItem[]
  error?: string
}

export type WebinarItem = {
  title: string
  subtitle: string
  description: string
  jp: string
  badge: string
  dateRange: string
  timeRange: string
  organizer: string
  status: string
  link: string
  image: string
}

// ─── Cookie Jar (no tough-cookie dependency) ────────────────────────────────

class SimpleCookieJar {
  private cookies = new Map<string, string>()

  /** Parse Set-Cookie header(s) and store cookies */
  ingest(setCookieHeaders: string[] | string | null) {
    if (!setCookieHeaders) return
    const arr = Array.isArray(setCookieHeaders) ? setCookieHeaders : [setCookieHeaders]
    for (const raw of arr) {
      // Take only the name=value part before the first ';'
      const pair = raw.split(';')[0].trim()
      const eqIdx = pair.indexOf('=')
      if (eqIdx > 0) {
        const name = pair.slice(0, eqIdx).trim()
        const value = pair.slice(eqIdx + 1).trim()
        this.cookies.set(name, value)
      }
    }
  }

  /** Build the Cookie header string */
  toHeader(): string {
    return Array.from(this.cookies.entries())
      .map(([k, v]) => `${k}=${v}`)
      .join('; ')
  }
}

// ─── HTTP helpers ───────────────────────────────────────────────────────────

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36'

interface FetchOpts {
  method?: string
  headers?: Record<string, string>
  body?: any
  redirect?: 'follow' | 'manual'
  timeout?: number
}

/**
 * Lightweight fetch wrapper that manages cookies automatically.
 * Follows up to 5 redirects while preserving cookies.
 */
async function http(
  url: string,
  jar: SimpleCookieJar,
  opts: FetchOpts = {}
): Promise<{ status: number; data: any; headers: Headers }> {
  const maxRedirects = 5
  let currentUrl = url
  const timeout = opts.timeout ?? 30_000

  for (let i = 0; i <= maxRedirects; i++) {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), timeout)

    try {
      const res = await fetch(currentUrl, {
        method: opts.method || 'GET',
        headers: {
          'User-Agent': UA,
          Cookie: jar.toHeader(),
          ...opts.headers,
        },
        body: opts.body,
        redirect: 'manual',
        signal: controller.signal,
      })
      clearTimeout(timer)

      // Ingest cookies from every response
      // getSetCookie() available in Node 20+; fallback to get('set-cookie') for older
      let setCookies: string[] = []
      if (typeof res.headers.getSetCookie === 'function') {
        setCookies = res.headers.getSetCookie()
      } else {
        const sc = res.headers.get('set-cookie')
        if (sc) setCookies = Array.isArray(sc) ? sc : [sc]
      }
      jar.ingest(setCookies)

      // Handle redirects (3xx)
      if ([301, 302, 303, 307, 308].includes(res.status)) {
        const location = res.headers.get('location')
        if (!location) break
        // Resolve relative redirects
        currentUrl = new URL(location, currentUrl).toString()
        // After a 303, switch to GET
        if (res.status === 303) {
          opts.method = 'GET'
          opts.body = undefined
        }
        continue
      }

      // Read body
      const contentType = res.headers.get('content-type') || ''
      let data: any
      if (contentType.includes('application/json')) {
        const text = await res.text()
        try { data = JSON.parse(text) } catch { data = text }
      } else {
        data = await res.text()
      }

      return { status: res.status, data, headers: res.headers }
    } finally {
      clearTimeout(timer)
    }
  }

  throw new Error(`Too many redirects fetching ${currentUrl}`)
}

function buildFormData(fields: Record<string, string>): string {
  return Object.entries(fields)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join('&')
}

// ─── HTML Parsing ───────────────────────────────────────────────────────────

function parseProductBoxes(html: string): WebinarItem[] {
  const $ = cheerio.load(html)
  const items: WebinarItem[] = []

  // Check #html_response first (fallback container)
  const htmlResponseEl = $('#html_response')
  if (htmlResponseEl.length > 0) {
    const scoped = htmlResponseEl.html() || ''
    if (scoped.trim().length > 0) {
      const $s = cheerio.load(scoped)
      const scopedBoxes = $s('.product-box')
      if (scopedBoxes.length > 0) {
        return extractBoxes($s, $s('.product-box'))
      }
    }
  }

  const boxes = $('.product-box')
  if (boxes.length > 0) {
    return extractBoxes($, boxes)
  }

  return items
}

function extractBoxes($: CheerioAPI, boxes: Cheerio<any>): WebinarItem[] {
  const items: WebinarItem[] = []

  boxes.each((_: number, boxNode: any) => {
    const box = $(boxNode)
    const details = box.find('.product-details').first()
    const imgDiv = box.find('.product-img').first()

    const title = details.find('h4').first().text().trim()
    const subtitle = details.find('small').first().text().trim()
    const jp = details.find('strong').first().text().trim()
    const badge = details.find('.badge').first().text().trim()
    const timeRange = details.find('label').first().text().trim()

    let dateRange = ''
    const detailsHtml = details.html() || ''
    const hrParts = detailsHtml.split(/<hr\s*\/?>/i)
    if (hrParts.length > 1) {
      const after = hrParts[hrParts.length - 1]
      const m = after.match(/^\s*([\s\S]*?)(?:<label|<|$)/i)
      if (m) dateRange = m[1].replace(/<[^>]+>/g, '').trim()
    }

    const statuses: string[] = []
    imgDiv.find('.ribbon').each((_: number, r: any) => {
      const t = $(r).text().trim()
      if (t) statuses.push(t)
    })

    const image = imgDiv.find('img').first().attr('src') || ''
    const link =
      box.find('a.btn').first().attr('href') ||
      details.find('a[href]').first().attr('href') ||
      ''

    let organizer = ''
    const m2 = detailsHtml.match(/<\/strong>\s*([\s\S]*?)(?:<hr|$)/i)
    if (m2) organizer = m2[1].replace(/<[^>]+>/g, '').trim()

    const descParts = [subtitle, jp, badge, organizer, dateRange, timeRange, statuses.join(', ')].filter(Boolean)
    const description = descParts.join(' | ') || subtitle || ''

    if (title) {
      items.push({
        title,
        subtitle,
        description,
        jp,
        badge,
        dateRange,
        timeRange,
        organizer,
        status: statuses.join(', '),
        link,
        image,
      })
    }
  })

  return items
}

function parseGenericHtml(html: string): WebinarItem[] {
  const $ = cheerio.load(html)
  const items: WebinarItem[] = []

  // Try .card elements
  const cards = $('.card, .product-box, article, .item')
  cards.each((_: number, node: any) => {
    const el = $(node)
    const title =
      el.find('h4, h3, h2, .title').first().text().trim() || ''
    const description =
      el.find('p, .description, small').first().text().trim() || ''
    const link = el.find('a[href]').first().attr('href') || ''
    const image = el.find('img').first().attr('src') || ''

    if (title) items.push({ title, subtitle: '', description, jp: '', badge: '', dateRange: '', timeRange: '', organizer: '', status: '', link, image })
  })

  // Fallback: parse table rows
  if (items.length === 0) {
    $('table').each((_: number, table: any) => {
      const headers: string[] = []
      $(table).find('thead th, thead td').each((_: number, th: any) => {
        headers.push($(th).text().trim().toLowerCase().replace(/\s+/g, '_'))
      })
      $(table).find('tbody tr, tr').each((_: number, tr: any) => {
        const cells = $(tr).find('td')
        if (cells.length === 0) return
        const row: Record<string, string> = {}
        cells.each((i: number, td: any) => {
          row[headers[i] || `c${i}`] = $(td).text().trim()
          const lnk = $(td).find('a[href]').first().attr('href')
          if (lnk) row.link = lnk
        })
        const title = row.judul || row.title || row.nama || row.c0 || ''
        if (title) {
          items.push({
            title,
            subtitle: '',
            description: row.deskripsi || row.description || row.c1 || '',
            jp: '', badge: '', dateRange: '', timeRange: '',
            organizer: '', status: '',
            link: row.link || '',
            image: '',
          })
        }
      })
    })
  }

  return items
}

// ─── Public API ─────────────────────────────────────────────────────────────

const LOGIN_PAGE_URL =
  'https://semestabangkom.id/member/login?token=fe085afcffe7e43304a9cca3c276b218ea092c2855e5642337d7acd0253aa855c83d687bb991a7bca19c073f2b6fb2e6347049a01ac46429a789501d6fd6618awb39aUL%2BrXcrHGSOFwnzwQ556rBkrt7ohC%2BwKIddWVM%3D'
const LOGIN_API_URL = 'https://semestabangkom.id/member//login/do_login'
const LIST_DATA_URL = 'https://semestabangkom.id/member//monitor_webinar/data_webinar/list_data'

async function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms))
}

/**
 * Fetch webinar data from Semestabangkom using native Node.js fetch.
 * No axios / tough-cookie / axios-cookiejar-support dependencies.
 */
export async function fetchSemestaNative(tokenUrl?: string): Promise<SemestaResult> {
  const email = process.env.SEMESTA_EMAIL || 'luqmanhcq29@gmail.com'
  const password = process.env.SEMESTA_PASSWORD || '12345678'
  if (!email || !password) {
    return { status: 'error', http: {}, error: 'Missing SEMESTA_EMAIL or SEMESTA_PASSWORD' }
  }

  const cacheKey = `semesta-native:${email}`
  const cached = getCache(cacheKey)
  if (cached) {
    console.log('[SemestaNative] Cache hit')
    return { status: 'ok', http: {}, data: cached, sample: cached.slice(0, 5) }
  }

  const jar = new SimpleCookieJar()
  let loginStatus: number | undefined
  let dataStatus: number | undefined

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      console.log(`[SemestaNative] Login attempt ${attempt + 1}/3...`)

      // Step 1: Visit login page (establish session cookies)
      await http(LOGIN_PAGE_URL, jar)

      // Step 2: POST login
      const loginBody = buildFormData({
        email,
        'login[password]': password,
      })
      const loginRes = await http(LOGIN_API_URL, jar, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: loginBody,
      })
      loginStatus = loginRes.status

      const loginData = typeof loginRes.data === 'string' ? JSON.parse(loginRes.data) : loginRes.data
      if (loginData?.status !== true) {
        console.warn('[SemestaNative] Login failed:', loginData?.error_login)
        if (attempt < 2) { await delay(1000 * Math.pow(2, attempt)); continue }
        return { status: 'error', http: { loginStatus }, error: `Login gagal: ${loginData?.error_login || 'Unknown'}` }
      }

      console.log('[SemestaNative] Login successful!')
      const dataToken = loginData.token || ''

      // Step 3: GET data_webinar page
      const dataPageUrl = tokenUrl ||
        `https://semestabangkom.id/member/monitor_webinar/data_webinar?token=${encodeURIComponent(dataToken)}`
      const pageRes = await http(dataPageUrl, jar, {
        headers: { Referer: 'https://semestabangkom.id/member/login' },
      })

      // Step 4: POST list_data API
      const listBody = buildFormData({ tanggal_awal: '', tanggal_akhir: '', judul: '' })
      const listRes = await http(LIST_DATA_URL, jar, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'X-Requested-With': 'XMLHttpRequest',
          Referer: dataPageUrl,
        },
        body: listBody,
      })
      dataStatus = listRes.status
      console.log('[SemestaNative] list_data status:', dataStatus)

      let parsed: WebinarItem[] = []

      // Parse list_data JSON response: { status: true, data: "<html>..." }
      const listJson = typeof listRes.data === 'string'
        ? (() => { try { return JSON.parse(listRes.data) } catch { return null } })()
        : listRes.data

      if (listJson?.status === true && typeof listJson.data === 'string') {
        console.log('[SemestaNative] list_data HTML length:', listJson.data.length)
        parsed = parseProductBoxes(listJson.data)
        console.log('[SemestaNative] Parsed from list_data:', parsed.length, 'items')
      }

      // Fallback: parse the data_webinar page HTML
      if (parsed.length === 0 && typeof pageRes.data === 'string') {
        console.log('[SemestaNative] Fallback: parsing data page HTML...')
        parsed = parseProductBoxes(pageRes.data)
        if (parsed.length === 0) parsed = parseGenericHtml(pageRes.data)
        console.log('[SemestaNative] Parsed from page HTML:', parsed.length, 'items')
      }

      // Final fallback: list_data response as HTML
      if (parsed.length === 0 && typeof listRes.data === 'string') {
        console.log('[SemestaNative] Fallback: parsing list_data as HTML...')
        parsed = parseProductBoxes(listRes.data)
        if (parsed.length === 0) parsed = parseGenericHtml(listRes.data)
        console.log('[SemestaNative] Parsed from list_data HTML:', parsed.length, 'items')
      }

      console.log('[SemestaNative] Total parsed items:', parsed.length)
      if (parsed.length > 0) {
        setCache(cacheKey, parsed, 300)
        return {
          status: 'ok',
          http: { loginStatus, dataStatus },
          data: parsed,
          sample: parsed.slice(0, 5),
        }
      }

      return {
        status: 'error',
        http: { loginStatus, dataStatus },
        error: `Login OK but no items parsed from response`,
      }
    } catch (err: any) {
      console.error(`[SemestaNative] Attempt ${attempt + 1} error:`, err.message)
      if (attempt < 2) await delay(1000 * Math.pow(2, attempt))
      else return { status: 'error', http: { loginStatus, dataStatus }, error: err.message || String(err) }
    }
  }

  return { status: 'error', http: {}, error: 'Unexpected failure after 3 attempts' }
}

/**
 * Fetch and parse webinar data from a generic HTML page.
 */
export async function fetchExternalHtmlNative(sourceUrl: string): Promise<SemestaResult> {
  const cacheKey = `external-native:${sourceUrl}`
  const cached = getCache(cacheKey)
  if (cached) {
    return { status: 'ok', http: { dataStatus: 200 }, data: cached, sample: cached.slice(0, 5) }
  }

  try {
    const res = await fetch(sourceUrl, {
      headers: { 'User-Agent': UA },
      signal: AbortSignal.timeout(30_000),
    })

    if (!res.ok) {
      return { status: 'error', http: { dataStatus: res.status }, error: `HTTP ${res.status}` }
    }

    const html = await res.text()
    let parsed = parseProductBoxes(html)
    if (parsed.length === 0) parsed = parseGenericHtml(html)

    if (parsed.length === 0) {
      return { status: 'error', http: { dataStatus: res.status }, error: 'Unable to parse external HTML' }
    }

    setCache(cacheKey, parsed, 300)
    return { status: 'ok', http: { dataStatus: res.status }, data: parsed, sample: parsed.slice(0, 5) }
  } catch (err: any) {
    return { status: 'error', http: {}, error: err.message || String(err) }
  }
}
