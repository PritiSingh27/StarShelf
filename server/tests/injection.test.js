import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from './helpers/testApp.js';

describe('Injection protection tests', () => {
  const reqHeaders = { 'X-Requested-With': 'XMLHttpRequest' };

  it('handles SQL injection attempts in search safely', async () => {
    const resSql = await request(app)
      .get("/api/stores?search=' OR 1=1 --")
      .set(reqHeaders);
    expect(resSql.status).not.toBe(500);

    const resWildcard = await request(app).get('/api/stores?search=%').set(reqHeaders);
    expect(resWildcard.status).not.toBe(500);
  });

  it('handles operator injection in JSON body safely', async () => {
    const resOp = await request(app)
      .post('/api/auth/login')
      .set(reqHeaders)
      .send({
        email: { $gt: '' },
        password: 'Password@123',
      });
    expect(resOp.status).toBe(400);
  });

  it('handles query parameter array injection safely', async () => {
    const resArr = await request(app)
      .get('/api/admin/users?name[]=a&name[]=b')
      .set(reqHeaders);
    expect(resArr.status).not.toBe(500);
  });

  it('handles sortBy injection attempt safely', async () => {
    const resSort = await request(app)
      .get('/api/admin/users?sortBy=name;drop table "User"')
      .set(reqHeaders);
    expect(resSort.status).not.toBe(500);
  });
});
