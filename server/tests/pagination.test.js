import { describe, it, expect } from 'vitest';
import { parsePagination } from '../src/shared/utils/pagination.js';

describe('Pagination utility tests', () => {
  it('clamps limit above 50 to 50', () => {
    const parsed = parsePagination({ page: '1', limit: '1000' });
    expect(parsed.limit).toBe(50);
    expect(parsed.take).toBe(50);
  });

  it('throws 400 HttpError when page is 0 or non-integer', () => {
    expect(() => parsePagination({ page: '0' })).toThrow();
    expect(() => parsePagination({ page: 'invalid' })).toThrow();
  });

  it('generates accurate metadata', () => {
    const parsed = parsePagination({ page: '2', limit: '10' });
    const meta = parsed.getMeta(25);
    expect(meta.page).toBe(2);
    expect(meta.limit).toBe(10);
    expect(meta.total).toBe(25);
    expect(meta.totalPages).toBe(3);
    expect(meta.hasNext).toBe(true);
  });
});
