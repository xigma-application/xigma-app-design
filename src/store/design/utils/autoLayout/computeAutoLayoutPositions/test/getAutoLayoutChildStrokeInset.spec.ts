// types
import { LayoutVersion, StrokeAlign } from 'types/design/enums';
import { TAutoLayoutChildSize } from '../../getAutoLayoutChildPositions/getAutoLayoutChildPositions';

// utils
import { getAutoLayoutChildStrokeInset } from '../getAutoLayoutChildStrokeInset';

const child = (overrides: Partial<TAutoLayoutChildSize> = {}): TAutoLayoutChildSize => ({
  height: 20,
  id: 'a',
  width: 40,
  ...overrides,
});

describe('getAutoLayoutChildStrokeInset', () => {
  it('should return the stroke width for an inside-aligned stroke under the updated version', () => {
    expect(getAutoLayoutChildStrokeInset(child({ strokeAlign: StrokeAlign.inside, strokeWidth: 6 }), LayoutVersion.updated)).toBe(6);
  });

  it('should return 0 for a centred stroke under the updated version', () => {
    expect(getAutoLayoutChildStrokeInset(child({ strokeAlign: StrokeAlign.center, strokeWidth: 6 }), LayoutVersion.updated)).toBe(0);
  });

  it('should return 0 for an outside stroke under the updated version', () => {
    expect(getAutoLayoutChildStrokeInset(child({ strokeAlign: StrokeAlign.outside, strokeWidth: 6 }), LayoutVersion.updated)).toBe(0);
  });

  it('should treat a stroke with no explicit alignment as centred under the updated version', () => {
    expect(getAutoLayoutChildStrokeInset(child({ strokeWidth: 6 }), LayoutVersion.updated)).toBe(0);
  });

  it('should return 0 when the child has no stroke width', () => {
    expect(getAutoLayoutChildStrokeInset(child({ strokeAlign: StrokeAlign.inside }), LayoutVersion.updated)).toBe(0);
  });

  it('should always return 0 under the legacy version', () => {
    expect(getAutoLayoutChildStrokeInset(child({ strokeAlign: StrokeAlign.inside, strokeWidth: 6 }), LayoutVersion.legacy)).toBe(0);
  });
});
