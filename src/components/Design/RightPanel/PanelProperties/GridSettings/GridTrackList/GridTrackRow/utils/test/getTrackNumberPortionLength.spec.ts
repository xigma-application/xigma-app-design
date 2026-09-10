// utils
import { getTrackNumberPortionLength } from '../getTrackNumberPortionLength';

describe('getTrackNumberPortionLength', () => {
  it('should return the length of a plain integer prefix before the unit', () => {
    expect(getTrackNumberPortionLength('1fr')).toBe(1);
  });

  it('should include the decimal part of the number prefix', () => {
    expect(getTrackNumberPortionLength('0.75fr')).toBe(4);
  });

  it('should handle a leading-dot decimal', () => {
    expect(getTrackNumberPortionLength('.5fr')).toBe(2);
  });

  it('should fall back to the whole string when there is no leading number', () => {
    expect(getTrackNumberPortionLength('fr')).toBe(2);
  });
});
