import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from './helpers/testApp.js';

describe('Rate limiting tests', () => {
  const reqHeaders = {
    'X-Requested-With': 'XMLHttpRequest',
    'X-Test-Rate-Limit': 'true',
  };

  it('sets Retry-After header on rate limit exceed', async () => {
    const attempts = [];
    for (let i = 0; i < 12; i++) {
      attempts.push(
        request(app)
          .post('/api/auth/login')
          .set(reqHeaders)
          .send({ email: 'rate_test@example.com', password: 'WrongPassword@123' })
      );
    }
    const responses = await Promise.all(attempts);
    const ratelimited = responses.find((r) => r.status === 429);
    expect(ratelimited).toBeDefined();
    if (ratelimited) {
      expect(ratelimited.headers['retry-after']).toBeDefined();
      expect(ratelimited.body.message).toBeDefined();
    }
  });
});
