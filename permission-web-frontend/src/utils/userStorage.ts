import AES from 'crypto-js/aes';
import Utf8 from 'crypto-js/enc-utf8';
import type { UserInfo } from '@/types';

const STORAGE_PREFIX = 'pc1:';

const MIN_SECRET_LEN = 16;

/**
 * 仅持久化登录展示与鉴权所需字段，避免扩大 XSS 时可读数据面。
 */
export function sanitizeUserForStorage(raw: unknown): UserInfo | null {
  if (!raw || typeof raw !== 'object') {
    return null;
  }
  const o = raw as Record<string, unknown>;
  const userId = o.userId;
  const userName = o.userName;
  if (typeof userId !== 'string' || typeof userName !== 'string') {
    return null;
  }
  const out: UserInfo = { userId, userName };
  if (typeof o.loginType === 'string') out.loginType = o.loginType;
  if (Array.isArray(o.permissions)) {
    out.permissions = o.permissions.filter((p): p is string => typeof p === 'string');
  }
  if (Array.isArray(o.modules)) {
    out.modules = o.modules.filter((m): m is string => typeof m === 'string');
  }
  if (typeof o.admin === 'boolean') out.admin = o.admin;
  return out;
}

function storageSecret(): string | undefined {
  const s = import.meta.env.VITE_USER_STORAGE_SECRET as string | undefined;
  return s && s.length >= MIN_SECRET_LEN ? s : undefined;
}

export function encodeUserForSession(raw: unknown): string {
  const safe = sanitizeUserForStorage(raw);
  if (!safe) {
    return '';
  }
  const secret = storageSecret();
  if (secret) {
    return STORAGE_PREFIX + AES.encrypt(JSON.stringify(safe), secret).toString();
  }
  return JSON.stringify(safe);
}

export function decodeUserFromSession(raw: string): unknown {
  if (!raw) {
    return null;
  }
  if (raw.startsWith(STORAGE_PREFIX)) {
    const secret = storageSecret();
    if (!secret) {
      return null;
    }
    try {
      const dec = AES.decrypt(raw.slice(STORAGE_PREFIX.length), secret);
      const str = dec.toString(Utf8);
      if (!str) return null;
      return JSON.parse(str) as unknown;
    } catch {
      return null;
    }
  }
  try {
    return JSON.parse(raw) as unknown;
  } catch {
    return null;
  }
}
