import { AppRole } from '../../types';
import { isCitizenRole, isSiteManagerRole } from '../../roles';

describe('role helpers', () => {
  it('recognizes site manager role aliases', () => {
    expect(isSiteManagerRole(AppRole.LINE_MANAGER)).toBe(true);
    expect(isSiteManagerRole(AppRole.SITE_MANAGER)).toBe(true);
    expect(isSiteManagerRole('Site Manager')).toBe(true);
    expect(isSiteManagerRole('site-manager')).toBe(true);
    expect(isSiteManagerRole('sitemanager')).toBe(true);
  });

  it('recognizes citizen roles only as citizens', () => {
    expect(isCitizenRole(AppRole.CITIZEN)).toBe(true);
    expect(isCitizenRole(' citizen ')).toBe(true);
    expect(isCitizenRole(AppRole.LINE_MANAGER)).toBe(false);
    expect(isCitizenRole(undefined)).toBe(false);
  });

  it('rejects non-site-manager roles', () => {
    expect(isSiteManagerRole(AppRole.CITIZEN)).toBe(false);
    expect(isSiteManagerRole('dispatcher')).toBe(false);
    expect(isSiteManagerRole(null)).toBe(false);
  });
});
