const MAX_KEY_LENGTH: number = 500;
const MAX_VALUE_LENGTH: number = 1500000;
const AUTO_LOCK_ENABLED: boolean = false;
const MAX_ACTIVITY_ENTRIES: number = 200;
const AUTO_LOCK_MS: number = 5 * 60 * 1000; // fixed auto-lock duration
const RATE_LIMITER_POINTS: number = 10000;
const RATE_LIMITER_DURATION: number = 10; // seconds

export {
  MAX_KEY_LENGTH,
  MAX_VALUE_LENGTH,
  AUTO_LOCK_ENABLED,
  MAX_ACTIVITY_ENTRIES,
  AUTO_LOCK_MS,
  RATE_LIMITER_POINTS,
  RATE_LIMITER_DURATION,
};
