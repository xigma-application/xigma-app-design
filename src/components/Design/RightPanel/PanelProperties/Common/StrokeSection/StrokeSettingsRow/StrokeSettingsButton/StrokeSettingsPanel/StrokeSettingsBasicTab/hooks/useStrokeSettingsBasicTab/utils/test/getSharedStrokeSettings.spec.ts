// types
import { StrokeDashCap, StrokeJoin, StrokeStyle } from 'types/design/enums';
import { TStrokeSettingsValues } from '../../types';

// utils
import { getSharedStrokeSettings } from '../getSharedStrokeSettings';

const values = (patch: Partial<TStrokeSettingsValues> = {}): TStrokeSettingsValues => ({
  dash: 4,
  dashCap: StrokeDashCap.none,
  dashes: [4, 2],
  gap: 2,
  hasDashes: false,
  isCustom: true,
  isDashed: true,
  isMiter: true,
  join: StrokeJoin.miter,
  miterAngle: 28,
  style: StrokeStyle.dashed,
  ...patch,
});

describe('getSharedStrokeSettings', () => {
  it('should keep the values shared by every stroke', () => {
    // before
    const result = getSharedStrokeSettings([values(), values()]);

    // result
    expect(result).toEqual({
      dash: 4,
      dashCap: StrokeDashCap.none,
      dashes: [4, 2],
      gap: 2,
      hasDashes: false,
      isCustom: true,
      isDashed: true,
      isMiter: true,
      isWidthProfileDisabled: false,
      join: StrokeJoin.miter,
      miterAngle: 28,
      style: StrokeStyle.dashed,
    });
  });

  it('should drop mixed values and disable the width profile when any stroke has dashes', () => {
    // before
    const result = getSharedStrokeSettings([values(), values({ dashes: [1], gap: 5, hasDashes: true, isMiter: false })]);

    // result
    expect(result).toMatchObject({
      dash: 4,
      dashes: undefined,
      gap: undefined,
      hasDashes: false,
      isMiter: false,
      isWidthProfileDisabled: true,
    });
  });
});
