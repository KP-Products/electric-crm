import { User } from 'model/user';

interface AuthTokenPayload {
  id?: string | number;
  sub?: string | number;
  userId?: string | number;
}

export const decodeAuthTokenPayload = (token?: string) => {
  const payload = token?.split('.')[1];
  if (!payload || typeof window === 'undefined') return undefined;

  try {
    const normalizedPayload = payload.replace(/-/g, '+').replace(/_/g, '/');
    const paddedPayload = normalizedPayload.padEnd(
      Math.ceil(normalizedPayload.length / 4) * 4,
      '='
    );
    const decodedPayload = decodeURIComponent(
      window
        .atob(paddedPayload)
        .split('')
        .map((char) => `%${char.charCodeAt(0).toString(16).padStart(2, '0')}`)
        .join('')
    );

    return JSON.parse(decodedPayload) as AuthTokenPayload;
  } catch {
    return undefined;
  }
};

export const normalizeAuthId = (value?: string | number) => {
  const normalizedValue = String(value ?? '').trim();
  if (!normalizedValue) return undefined;

  const numericValue = Number(normalizedValue);
  return Number.isFinite(numericValue) && String(numericValue) === normalizedValue
    ? numericValue
    : normalizedValue;
};

export const getAuthUserId = (user?: Pick<User, 'id'> | null, token?: string) => {
  const tokenPayload = decodeAuthTokenPayload(token);
  return normalizeAuthId(user?.id || tokenPayload?.id || tokenPayload?.userId || tokenPayload?.sub);
};
