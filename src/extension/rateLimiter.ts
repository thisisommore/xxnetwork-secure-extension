import { RateLimiterMemory } from "rate-limiter-flexible";
import {
  RATE_LIMITER_POINTS,
  RATE_LIMITER_DURATION,
  MAX_ACTIVE_REQUESTS,
} from "../constants";

let activeRequests = 0;
export const requestsDone = () => {
  activeRequests--;
};

const limiter = new RateLimiterMemory({
  points: RATE_LIMITER_POINTS,
  duration: RATE_LIMITER_DURATION,
});

export const consume = async (points: number = 1) => {
  const consumeRes = await limiter.consume("global", points);
  if (activeRequests >= MAX_ACTIVE_REQUESTS) {
    throw new Error("MAX_ACTIVE_REQUESTS limit reached");
  }
  activeRequests++;
  if (consumeRes instanceof Error) {
    throw consumeRes;
  }
  return consumeRes;
};
