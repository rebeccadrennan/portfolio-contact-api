import 'dotenv/config';

type NodeEnv = 'development' | 'production' | 'test';

export interface Env {
  port: number;
  host: string;
  nodeEnv: NodeEnv;
  isProduction: boolean;
  frontendUrl: string;
  allowedOrigins: string[];
  missing: string[];
  resendApiKey?: string;
  resendFrom: string;
  contactToEmail?: string;
}

const required = ['FRONTEND_URL', 'RESEND_API_KEY'];

const missing = required.filter((key) => !process.env[key]);
if (!process.env.CONTACT_TO_EMAIL && !process.env.CONTACT_EMAIL) {
  missing.push('CONTACT_TO_EMAIL');
}

const frontendOrigin = process.env.FRONTEND_URL;

const getAlternateSubdomainOrigin = (origin?: string): string | null => {
  if (!origin) return null;

  try {
    const parsed = new URL(origin);
    const { hostname } = parsed;

    if (hostname.startsWith('www.')) {
      parsed.hostname = hostname.slice(4);
      return parsed.toString().replace(/\/$/, '');
    }

    parsed.hostname = `www.${hostname}`;
    return parsed.toString().replace(/\/$/, '');
  } catch {
    return null;
  }
};

const allowedOrigins = [frontendOrigin, getAlternateSubdomainOrigin(frontendOrigin)].filter(
  (origin): origin is string => Boolean(origin)
);

const normalizeResendFrom = (value?: string): string => {
  const fallback = 'Portfolio Contact <onboarding@resend.dev>';

  if (!value) return fallback;

  const trimmed = String(value).trim();
  const unquoted =
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
      ? trimmed.slice(1, -1).trim()
      : trimmed;

  const emailOnlyPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const namedEmailPattern = /^.+<[^\s@]+@[^\s@]+\.[^\s@]+>$/;

  if (emailOnlyPattern.test(unquoted) || namedEmailPattern.test(unquoted)) {
    return unquoted;
  }

  return fallback;
};

const nodeEnv = (process.env.NODE_ENV ?? 'development') as NodeEnv;

const env: Env = {
  port: parseInt(process.env.PORT ?? '', 10) || 3000,
  host: process.env.HOST ?? '0.0.0.0',
  nodeEnv,
  isProduction: nodeEnv === 'production',
  frontendUrl: process.env.FRONTEND_URL ?? '',
  allowedOrigins: [...new Set(allowedOrigins)],
  missing,
  resendApiKey: process.env.RESEND_API_KEY,
  resendFrom: normalizeResendFrom(process.env.RESEND_FROM),
  contactToEmail: process.env.CONTACT_TO_EMAIL || process.env.CONTACT_EMAIL,
};

export default env;
