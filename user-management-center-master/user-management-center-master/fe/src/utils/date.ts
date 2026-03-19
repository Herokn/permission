// 获取常用时间
import dayjs from 'dayjs'
import timezone from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'

// 扩展 dayjs 插件
dayjs.extend(utc)
dayjs.extend(timezone)

export const LAST_7_DAYS = [
  dayjs().subtract(7, 'day').format('MM/DD/YYYY'),
  dayjs().subtract(1, 'day').format('MM/DD/YYYY'),
]

export const LAST_30_DAYS = [
  dayjs().subtract(30, 'day').format('MM/DD/YYYY'),
  dayjs().subtract(1, 'day').format('MM/DD/YYYY'),
]

/**
 * 将UTC时间字符串转换为时间戳
 * @param utcDateStr - UTC时间字符串 (如 "2025-12-05T10:12:03Z" 或 "2025-12-05T10:12:03.000Z")
 * @returns 时间戳(毫秒)，如果解析失败返回 null
 */
export function utcToTimestamp(utcDateStr?: string | null): number | null {
  if (!utcDateStr) return null

  try {
    const timestamp = dayjs.utc(utcDateStr).valueOf()
    return isNaN(timestamp) ? null : timestamp
  } catch (error) {
    console.warn('[Date Utils] Failed to parse UTC date:', utcDateStr, error)
    return null
  }
}

/**
 * 将时间戳转换为本地时区的时间字符串
 * @param timestamp - 时间戳(毫秒)
 * @param format - 格式类型: 'datetime' | 'date' | 'time' | 自定义格式字符串
 * @returns 格式化的时间字符串
 */
export function timestampToLocalString(
  timestamp: number,
  format: 'datetime' | 'date' | 'time' | string = 'datetime'
): string {
  const dayjsObj = dayjs(timestamp)

  switch (format) {
    case 'date':
      return dayjsObj.format('MM/DD/YYYY')
    case 'time':
      return dayjsObj.format('HH:mm:ss')
    case 'datetime':
      return dayjsObj.format('MM/DD/YYYY HH:mm:ss')
    default:
      // 支持自定义格式字符串
      return dayjsObj.format(format)
  }
}

/**
 * 将UTC时间字符串转换为本地时区的时间字符串 (通用方法)
 * @param utcDateStr - UTC时间字符串 (如 "2025-12-05T10:12:03Z")
 * @param format - 格式类型: 'datetime' | 'date' | 'time' | 自定义格式字符串, 默认 'datetime'
 * @param showTimezone - 是否显示时区信息, 默认 false
 * @returns 本地时区的时间字符串 (如 "2025-12-05 18:12:03")，解析失败返回 '-'
 *
 * @example
 * formatUTCToLocal('2025-12-05T10:12:03Z') // => '12-05-2025 18:12:03' (东八区)
 * formatUTCToLocal('2025-12-05T10:12:03Z', 'date') // => '12/05/2025'
 * formatUTCToLocal('2025-12-05T10:12:03Z', 'time') // => '18:12:03'
 * formatUTCToLocal('2025-12-05T10:12:03Z', 'datetime', true) // => '12-05-2025 18:12:03 (CST, UTC+08:00)'
 * formatUTCToLocal('2025-12-05T10:12:03Z', 'YYYY/MM/DD HH:mm') // => '2025/12/05 18:12'
 * formatUTCToLocal(null) // => '-'
 */
export function formatUTCToLocal(
  utcDateStr?: string | null,
  format: 'datetime' | 'date' | 'time' | string = 'datetime',
  showTimezone: boolean = true
): string {
  if (!utcDateStr) return '-'

  try {
    const dayjsObj = dayjs.utc(utcDateStr).local()

    if (!dayjsObj.isValid()) {
      return '-'
    }

    let result: string
    switch (format) {
      case 'date':
        result = dayjsObj.format('MM/DD/YYYY')
        break
      case 'time':
        result = dayjsObj.format('HH:mm:ss')
        break
      case 'datetime':
        result = dayjsObj.format('MM/DD/YYYY HH:mm:ss')
        break
      default:
        // 支持自定义格式字符串
        result = dayjsObj.format(format)
    }

    // 如果需要显示时区信息，拼接时区缩写和 UTC 偏移
    if (showTimezone) {
      const timezoneAbbr = getTimezoneAbbr()
      const timezoneOffset = getTimezoneOffset()
      result = `${result} (${timezoneAbbr}, ${timezoneOffset})`
    }

    return result
  } catch (error) {
    console.warn('[Date Utils] Failed to format UTC date:', utcDateStr, error)
    return '-'
  }
}

/**
 * 获取当前时区偏移量 (小时)
 * @returns 时区偏移量，例如东八区返回 8，西五区返回 -5
 */
export function getTimezoneOffsetHours(): number {
  return dayjs().utcOffset() / 60
}

/**
 * 获取当前时区名称
 * @returns 时区名称，例如 'Asia/Shanghai', 'America/New_York'
 */
export function getTimezoneName(): string {
  try {
    // 优先使用 dayjs timezone 插件
    if (dayjs.tz && typeof dayjs.tz.guess === 'function') {
      const tz = dayjs.tz.guess()
      if (tz) return tz
    }
  } catch (e) {
    // dayjs 插件失效时静默失败
  }

  // 降级：使用浏览器原生 Intl API
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
  } catch (e) {
    return 'UTC'
  }
}

/**
 * 获取当前时区偏移量的标准格式
 * @returns 时区偏移量，例如 'UTC+08:00', 'UTC-05:00'
 */
export function getTimezoneOffset(): string {
  let offset: number

  try {
    // 优先使用 dayjs
    offset = dayjs().utcOffset()
    if (typeof offset === 'number' && !isNaN(offset)) {
      const hours = Math.floor(Math.abs(offset) / 60)
      const minutes = Math.abs(offset) % 60
      const sign = offset >= 0 ? '+' : '-'
      return `UTC${sign}${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
    }
  } catch (e) {
    // dayjs 失效时继续降级
  }

  // 降级：使用原生 Date API
  offset = -new Date().getTimezoneOffset()
  const hours = Math.floor(Math.abs(offset) / 60)
  const minutes = Math.abs(offset) % 60
  const sign = offset >= 0 ? '+' : '-'
  return `UTC${sign}${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
}

/**
 * 获取时区缩写
 * @returns 时区缩写，例如 'CST', 'PST', 'EST', 'JST'
 */
export function getTimezoneAbbr(): string {
  try {
    const timezoneName = getTimezoneName()

    // 优先使用映射表确保返回标准缩写（覆盖全球主要时区）
    const timezoneAbbrMap: Record<string, string> = {
      // 亚洲
      'Asia/Shanghai': 'CST',
      'Asia/Chongqing': 'CST',
      'Asia/Urumqi': 'CST',
      'Asia/Beijing': 'CST',
      'Asia/Hong_Kong': 'HKT',
      'Asia/Macao': 'CST',
      'Asia/Taipei': 'CST',
      'Asia/Tokyo': 'JST',
      'Asia/Seoul': 'KST',
      'Asia/Singapore': 'SGT',
      'Asia/Bangkok': 'ICT',
      'Asia/Jakarta': 'WIB',
      'Asia/Kuala_Lumpur': 'MYT',
      'Asia/Manila': 'PHT',
      'Asia/Ho_Chi_Minh': 'ICT',
      'Asia/Kolkata': 'IST',
      'Asia/Calcutta': 'IST',
      'Asia/Dubai': 'GST',
      'Asia/Karachi': 'PKT',
      'Asia/Dhaka': 'BST',
      'Asia/Kathmandu': 'NPT',
      'Asia/Colombo': 'IST',
      'Asia/Yangon': 'MMT',
      'Asia/Rangoon': 'MMT',
      'Asia/Phnom_Penh': 'ICT',
      'Asia/Vientiane': 'ICT',
      'Asia/Brunei': 'BNT',
      'Asia/Istanbul': 'TRT',
      'Asia/Jerusalem': 'IST',
      'Asia/Riyadh': 'AST',
      'Asia/Kuwait': 'AST',
      'Asia/Bahrain': 'AST',
      'Asia/Qatar': 'AST',
      'Asia/Muscat': 'GST',
      'Asia/Tehran': 'IRST',
      'Asia/Baghdad': 'AST',
      'Asia/Amman': 'EET',
      'Asia/Beirut': 'EET',
      'Asia/Damascus': 'EET',

      // 北美洲
      'America/New_York': 'EST',
      'America/Chicago': 'CST',
      'America/Los_Angeles': 'PST',
      'America/Denver': 'MST',
      'America/Phoenix': 'MST',
      'America/Anchorage': 'AKST',
      'America/Honolulu': 'HST',
      'America/Toronto': 'EST',
      'America/Vancouver': 'PST',
      'America/Montreal': 'EST',
      'America/Mexico_City': 'CST',
      'America/Tijuana': 'PST',
      'America/Cancun': 'EST',

      // 南美洲
      'America/Sao_Paulo': 'BRT',
      'America/Buenos_Aires': 'ART',
      'America/Santiago': 'CLT',
      'America/Lima': 'PET',
      'America/Bogota': 'COT',
      'America/Caracas': 'VET',
      'America/Montevideo': 'UYT',

      // 欧洲
      'Europe/London': 'GMT',
      'Europe/Paris': 'CET',
      'Europe/Berlin': 'CET',
      'Europe/Madrid': 'CET',
      'Europe/Rome': 'CET',
      'Europe/Amsterdam': 'CET',
      'Europe/Brussels': 'CET',
      'Europe/Vienna': 'CET',
      'Europe/Zurich': 'CET',
      'Europe/Prague': 'CET',
      'Europe/Warsaw': 'CET',
      'Europe/Budapest': 'CET',
      'Europe/Athens': 'EET',
      'Europe/Helsinki': 'EET',
      'Europe/Stockholm': 'CET',
      'Europe/Oslo': 'CET',
      'Europe/Copenhagen': 'CET',
      'Europe/Dublin': 'GMT',
      'Europe/Lisbon': 'WET',
      'Europe/Moscow': 'MSK',
      'Europe/Kiev': 'EET',
      'Europe/Bucharest': 'EET',
      'Europe/Sofia': 'EET',
      'Europe/Belgrade': 'CET',
      'Europe/Zagreb': 'CET',
      'Europe/Ljubljana': 'CET',
      'Europe/Sarajevo': 'CET',
      'Europe/Skopje': 'CET',
      'Europe/Podgorica': 'CET',
      'Europe/Riga': 'EET',
      'Europe/Tallinn': 'EET',
      'Europe/Vilnius': 'EET',
      'Europe/Minsk': 'MSK',

      // 大洋洲
      'Australia/Sydney': 'AEDT',
      'Australia/Melbourne': 'AEDT',
      'Australia/Brisbane': 'AEST',
      'Australia/Perth': 'AWST',
      'Australia/Adelaide': 'ACDT',
      'Australia/Darwin': 'ACST',
      'Australia/Hobart': 'AEDT',
      'Pacific/Auckland': 'NZDT',
      'Pacific/Fiji': 'FJT',
      'Pacific/Guam': 'ChST',
      'Pacific/Honolulu': 'HST',
      'Pacific/Tahiti': 'TAHT',

      // 非洲
      'Africa/Cairo': 'EET',
      'Africa/Johannesburg': 'SAST',
      'Africa/Lagos': 'WAT',
      'Africa/Nairobi': 'EAT',
      'Africa/Casablanca': 'WET',
      'Africa/Algiers': 'CET',
      'Africa/Tunis': 'CET',
      'Africa/Khartoum': 'CAT',
      'Africa/Addis_Ababa': 'EAT',
      'Africa/Dar_es_Salaam': 'EAT',
      'Africa/Kampala': 'EAT',
      'Africa/Maputo': 'CAT',
      'Africa/Harare': 'CAT',
      'Africa/Lusaka': 'CAT',

      // 大西洋
      'Atlantic/Reykjavik': 'GMT',
      'Atlantic/Azores': 'AZOT',
      'Atlantic/Cape_Verde': 'CVT',

      // 印度洋
      'Indian/Mauritius': 'MUT',
      'Indian/Maldives': 'MVT',
    }

    // 如果有映射，直接返回
    if (timezoneAbbrMap[timezoneName]) {
      return timezoneAbbrMap[timezoneName]
    }

    // 使用浏览器原生 Intl API 获取时区缩写
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZoneName: 'short',
    })
    const parts = formatter.formatToParts(new Date())
    const timeZonePart = parts.find((part) => part.type === 'timeZoneName')

    if (timeZonePart && timeZonePart.value) {
      const tzValue = timeZonePart.value

      // 如果不是 GMT 格式且长度合理，返回该值
      if (!tzValue.startsWith('GMT') && tzValue.length <= 5) {
        return tzValue
      }
    }

    // 降级方案：使用 UTC 偏移
    return getTimezoneOffset().replace('UTC', 'GMT')
  } catch (error) {
    console.warn('[Date Utils] Failed to get timezone abbreviation:', error)
    return 'UTC'
  }
}

/**
 * 将UTC时间转换为带时区信息的本地时间字符串
 * @param utcDateStr - UTC时间字符串
 * @param format - 格式类型: 'datetime' | 'date' | 'time' | 自定义格式字符串
 * @returns 带时区信息的时间字符串，如 "12-05-2025 18:12:03 (CST, UTC+08:00)"
 */
export function formatUTCToLocalWithTimezone(
  utcDateStr?: string | null,
  format: 'datetime' | 'date' | 'time' | string = 'datetime'
): string {
  return formatUTCToLocal(utcDateStr, format, true)
}

/**
 * 格式化 UTC 时间为标准 UTC 字符串（用于 tooltip）
 * @param utcDateStr - UTC时间字符串
 * @returns UTC 时间字符串，如 "2024-11-03 06:30Z"
 */
export function formatAsUTC(utcDateStr?: string | null): string {
  if (!utcDateStr) return '-'

  try {
    const dayjsObj = dayjs.utc(utcDateStr)

    if (!dayjsObj.isValid()) {
      return '-'
    }

    return dayjsObj.format('YYYY-MM-DD HH:mm:ss') + 'Z'
  } catch (error) {
    console.warn('[Date Utils] Failed to format as UTC:', utcDateStr, error)
    return '-'
  }
}
