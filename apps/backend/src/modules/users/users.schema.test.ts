import { describe, it, expect } from 'vitest';
import { updateUserSchema, createUserSchema } from './users.schema';

describe('updateUserSchema', () => {
  it('validates partial update', () => {
    expect(updateUserSchema.safeParse({ display_name: 'Test' }).success).toBe(true);
  });

  it('validates role update', () => {
    expect(updateUserSchema.safeParse({ role: 'admin' }).success).toBe(true);
  });

  it('rejects invalid role', () => {
    expect(updateUserSchema.safeParse({ role: 'superadmin' }).success).toBe(false);
  });

  it('allows empty object', () => {
    expect(updateUserSchema.safeParse({}).success).toBe(true);
  });
});

describe('createUserSchema', () => {
  it('validates required fields', () => {
    const result = createUserSchema.safeParse({
      email: 'test@example.com',
      password: '123456',
    });
    expect(result.success).toBe(true);
  });

  it('rejects short password', () => {
    const result = createUserSchema.safeParse({
      email: 'test@example.com',
      password: '12345',
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid email', () => {
    const result = createUserSchema.safeParse({
      email: 'not-an-email',
      password: '123456',
    });
    expect(result.success).toBe(false);
  });
});
