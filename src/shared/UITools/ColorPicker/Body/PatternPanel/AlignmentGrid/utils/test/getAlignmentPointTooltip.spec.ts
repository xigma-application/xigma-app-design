import i18n from 'i18next';

// utils
import { getAlignmentPointTooltip } from '../getAlignmentPointTooltip';

const t = i18n.t;

describe('getAlignmentPointTooltip', () => {
  it('should label each of the 9 points by row and column', () => {
    expect(getAlignmentPointTooltip(0, t)).toBe('Align top left');
    expect(getAlignmentPointTooltip(1, t)).toBe('Align top');
    expect(getAlignmentPointTooltip(2, t)).toBe('Align top right');
    expect(getAlignmentPointTooltip(3, t)).toBe('Align left');
    expect(getAlignmentPointTooltip(4, t)).toBe('Align center');
    expect(getAlignmentPointTooltip(5, t)).toBe('Align right');
    expect(getAlignmentPointTooltip(6, t)).toBe('Align bottom left');
    expect(getAlignmentPointTooltip(7, t)).toBe('Align bottom');
    expect(getAlignmentPointTooltip(8, t)).toBe('Align bottom right');
  });
});
