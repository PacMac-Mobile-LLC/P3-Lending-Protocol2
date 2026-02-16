import { SecurityService } from '../../services/security';
import type { EmployeeProfile, SecurityCertificate } from '../../types';

describe('SecurityService', () => {
  it('validates a matching, non-expired certificate', () => {
    const cert: SecurityCertificate = {
      issuedTo: 'admin@p3lending.space',
      issuedAt: Date.now() - 1_000,
      expiresAt: Date.now() + 60_000,
      signature: 'sig-123',
    };

    const employee: EmployeeProfile = {
      id: 'emp-1',
      name: 'Admin User',
      email: 'admin@p3lending.space',
      role: 'ADMIN',
      isActive: true,
      passwordHash: 'hash',
      passwordLastSet: Date.now(),
      previousPasswords: [],
      certificateData: cert,
    };

    expect(SecurityService.validateCertificate(cert, employee)).toEqual({ valid: true });
  });

  it('rejects an expired certificate', () => {
    const cert: SecurityCertificate = {
      issuedTo: 'admin@p3lending.space',
      issuedAt: Date.now() - 10_000,
      expiresAt: Date.now() - 1,
      signature: 'sig-123',
    };

    const employee: EmployeeProfile = {
      id: 'emp-1',
      name: 'Admin User',
      email: 'admin@p3lending.space',
      role: 'ADMIN',
      isActive: true,
      passwordHash: 'hash',
      passwordLastSet: Date.now(),
      previousPasswords: [],
      certificateData: cert,
    };

    const result = SecurityService.validateCertificate(cert, employee);
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/expired/i);
  });

  it('checks password history reuse', () => {
    expect(SecurityService.checkPasswordHistory('new-pass', ['old-pass', 'new-pass'])).toBe(true);
    expect(SecurityService.checkPasswordHistory('new-pass', ['old-pass'])).toBe(false);
  });

  it('detects expired password timestamps', () => {
    const sixtyOneDaysAgo = Date.now() - 61 * 24 * 60 * 60 * 1000;
    const tenDaysAgo = Date.now() - 10 * 24 * 60 * 60 * 1000;

    expect(SecurityService.isPasswordExpired(sixtyOneDaysAgo)).toBe(true);
    expect(SecurityService.isPasswordExpired(tenDaysAgo)).toBe(false);
  });
});
