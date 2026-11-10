import { normalizeTicketCode } from './check-in.service';

describe('normalizeTicketCode', () => {
  it('strips demo prefixes and uppercases', () => {
    expect(normalizeTicketCode('edupass-demo:edp-abc')).toBe('EDP-ABC');
    expect(normalizeTicketCode(' EDUPASS:edp-xyz ')).toBe('EDP-XYZ');
    expect(normalizeTicketCode('edp-plain')).toBe('EDP-PLAIN');
  });
});
