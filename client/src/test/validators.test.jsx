import { describe, it, expect } from 'vitest';
import {
  nameSchema,
  addressSchema,
  emailSchema,
  passwordSchema,
  signupSchema,
  loginSchema,
  storeSchema,
  categorySchema,
} from '../lib/validators.js';

describe('Client Zod Validators', () => {
  describe('nameSchema', () => {
    it('passes for valid names between 20 and 60 characters', () => {
      const validName = 'Johnathan Edward Doe Senior';
      expect(nameSchema.parse(validName)).toBe(validName);
    });

    it('fails for names under 20 characters', () => {
      const result = nameSchema.safeParse('Short Name');
      expect(result.success).toBe(false);
    });

    it('fails for names over 60 characters', () => {
      const longName = 'A'.repeat(61);
      const result = nameSchema.safeParse(longName);
      expect(result.success).toBe(false);
    });
  });

  describe('addressSchema', () => {
    it('passes for valid non-empty address', () => {
      const addr = '123 Tech Park Boulevard, Suite 400';
      expect(addressSchema.parse(addr)).toBe(addr);
    });

    it('fails for empty address', () => {
      const result = addressSchema.safeParse('');
      expect(result.success).toBe(false);
    });
  });

  describe('emailSchema', () => {
    it('normalizes valid emails to lowercase', () => {
      expect(emailSchema.parse('USER@Example.COM')).toBe('user@example.com');
    });

    it('fails for invalid email strings', () => {
      const result = emailSchema.safeParse('not-an-email');
      expect(result.success).toBe(false);
    });
  });

  describe('passwordSchema', () => {
    it('passes for valid 8-16 char password with uppercase and special character', () => {
      expect(passwordSchema.parse('Secret@123')).toBe('Secret@123');
    });

    it('fails when missing uppercase letter', () => {
      const result = passwordSchema.safeParse('secret@123');
      expect(result.success).toBe(false);
    });

    it('fails when missing special character', () => {
      const result = passwordSchema.safeParse('Secret1234');
      expect(result.success).toBe(false);
    });

    it('fails when length is less than 8', () => {
      const result = passwordSchema.safeParse('Secr@1');
      expect(result.success).toBe(false);
    });
  });

  describe('signupSchema', () => {
    it('validates complete signup form data', () => {
      const formData = {
        name: 'Christopher Nolan Director',
        email: 'chris@hollywood.com',
        password: 'PassWord@2026',
        address: '100 Studio Way, Hollywood, CA',
      };
      const parsed = signupSchema.parse(formData);
      expect(parsed.email).toBe('chris@hollywood.com');
    });
  });

  describe('loginSchema', () => {
    it('validates email and non-empty password', () => {
      const loginData = { email: 'admin@starshelf.com', password: 'Password@123' };
      expect(loginSchema.parse(loginData)).toEqual(loginData);
    });
  });

  describe('storeSchema & categorySchema', () => {
    it('validates store schema correctly', () => {
      const validStore = {
        name: 'Tech Haven Superstore',
        email: 'contact@techhaven.com',
        address: '404 Innovation Way, Tech Park',
        categoryId: 1,
        ownerId: null,
      };
      expect(storeSchema.parse(validStore)).toEqual(validStore);
    });

    it('validates category schema correctly', () => {
      expect(categorySchema.parse({ name: 'Electronics' })).toEqual({ name: 'Electronics' });
      expect(categorySchema.safeParse({ name: 'A' }).success).toBe(false);
    });
  });
});
