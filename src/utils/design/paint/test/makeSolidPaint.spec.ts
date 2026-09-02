// utils
import { makeSolidPaint } from '../makeSolidPaint';

describe('makeSolidPaint', () => {
  it('should build a fully opaque solid paint by default', () => {
    expect(makeSolidPaint('#ff0000')).toEqual({ color: '#ff0000', opacity: 100, type: 'solid' });
  });

  it('should carry an explicit opacity through', () => {
    expect(makeSolidPaint('#00ff00', 40)).toEqual({ color: '#00ff00', opacity: 40, type: 'solid' });
  });
});
