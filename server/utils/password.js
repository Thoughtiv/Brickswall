import crypto from 'crypto';

const SCHEME = 'scrypt';
const KEY_LENGTH = 64;
const SALT_BYTES = 16;

/**
 * Hash a plaintext password using Node's built-in scrypt.
 * Stored format: scrypt$<salt-hex>$<derived-key-hex>
 * No external dependency is used so this works on any shared host.
 */
export function hashPassword(password) {
  const salt = crypto.randomBytes(SALT_BYTES).toString('hex');
  const derived = crypto.scryptSync(password, salt, KEY_LENGTH).toString('hex');
  return `${SCHEME}$${salt}$${derived}`;
}

/**
 * Verify a plaintext password against a stored hash (timing-safe).
 */
export function verifyPassword(password, stored) {
  try {
    if (typeof stored !== 'string') return false;
    const [scheme, salt, key] = stored.split('$');
    if (scheme !== SCHEME || !salt || !key) return false;

    const derived = crypto.scryptSync(password, salt, KEY_LENGTH);
    const expected = Buffer.from(key, 'hex');
    if (expected.length !== derived.length) return false;

    return crypto.timingSafeEqual(expected, derived);
  } catch (err) {
    return false;
  }
}

/**
 * Generate an opaque session token for a logged-in editor user.
 */
export function generateSessionToken() {
  return crypto.randomBytes(32).toString('hex');
}
