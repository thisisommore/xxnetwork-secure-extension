import { RateLimiterMemory } from "rate-limiter-flexible";
import { RATE_LIMITER_POINTS, RATE_LIMITER_DURATION } from "../constants";

const limiter = new RateLimiterMemory({
  points: RATE_LIMITER_POINTS,
  duration: RATE_LIMITER_DURATION,
});

export const consume = async (points: number = 1) => {
  return await limiter.consume("global", points);
};
