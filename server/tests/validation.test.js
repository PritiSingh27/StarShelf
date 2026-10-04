import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from './helpers/testApp.js';

describe('Validation tests', () => {
  const reqHeaders = { 'X-Requested-With': 'XMLHttpRequest' };

  it('rejects short name (19 chars) and long name (61 chars)', async () => {
    const resShort = await request(app)
      .post('/api/auth/register')
      .set(reqHeaders)
      .send({
        name: 'a'.repeat(19),
        email: 'test@example.com',
        password: 'Password@123',
        address: 'Valid Address',
      });
    expect(resShort.status).toBe(400);

    const resLong = await request(app)
      .post('/api/auth/register')
      .set(reqHeaders)
      .send({
        name: 'a'.repeat(61),
        email: 'test@example.com',
        password: 'Password@123',
        address: 'Valid Address',
      });
    expect(resLong.status).toBe(400);
  });

  it('rejects address over 400 characters', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .set(reqHeaders)
      .send({
        name: 'Valid User Name Here 123',
        email: 'test@example.com',
        password: 'Password@123',
        address: 'a'.repeat(401),
      });
    expect(res.status).toBe(400);
  });

  it('rejects password missing uppercase letter or special character', async () => {
    const resNoUpper = await request(app)
      .post('/api/auth/register')
      .set(reqHeaders)
      .send({
        name: 'Valid User Name Here 123',
        email: 'test@example.com',
        password: 'password@123',
        address: 'Valid Address',
      });
    expect(resNoUpper.status).toBe(400);

    const resNoSpecial = await request(app)
      .post('/api/auth/register')
      .set(reqHeaders)
      .send({
        name: 'Valid User Name Here 123',
        email: 'test@example.com',
        password: 'Password123',
        address: 'Valid Address',
      });
    expect(resNoSpecial.status).toBe(400);
  });

  it('rejects invalid email format', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .set(reqHeaders)
      .send({
        name: 'Valid User Name Here 123',
        email: 'invalid-email',
        password: 'Password@123',
        address: 'Valid Address',
      });
    expect(res.status).toBe(400);
  });

  it('rejects unknown fields on strict schemas', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .set(reqHeaders)
      .send({
        name: 'Valid User Name Here 123',
        email: 'test@example.com',
        password: 'Password@123',
        address: 'Valid Address',
        role: 'ADMIN',
      });
    expect(res.status).toBe(400);
  });
});
