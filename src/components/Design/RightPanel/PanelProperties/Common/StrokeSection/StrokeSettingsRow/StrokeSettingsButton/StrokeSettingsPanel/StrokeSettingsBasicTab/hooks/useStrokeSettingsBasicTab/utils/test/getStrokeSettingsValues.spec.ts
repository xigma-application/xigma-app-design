// types
import { StrokeAlign, StrokeDashCap, StrokeJoin, StrokeStyle } from 'types/design/enums';

// utils
import { getStrokeSettingsValues } from '../getStrokeSettingsValues';

describe('getStrokeSettingsValues', () => {
  it('should fall back to the Figma defaults when there is no node or no stored value', () => {
    // result
    expect(getStrokeSettingsValues(undefined)).toEqual({
      dash: 20,
      dashCap: StrokeDashCap.none,
      dashes: [20, 40, 60, 80],
      gap: 20,
      hasDashes: false,
      isCustom: false,
      isDashed: false,
      isMiter: false,
      join: StrokeJoin.miter,
      miterAngle: 28.96,
      style: StrokeStyle.solid,
    });
  });

  it('should make Gap follow Dash until Gap is set on its own', () => {
    expect(getStrokeSettingsValues({ strokeDash: 8 }).gap).toBe(8);
    expect(getStrokeSettingsValues({ strokeDash: 8, strokeGap: 3 }).gap).toBe(3);
  });

  it('should flag the dashed and custom styles', () => {
    expect(getStrokeSettingsValues({ strokeStyle: StrokeStyle.dashed })).toMatchObject({
      hasDashes: true,
      isCustom: false,
      isDashed: true,
    });
    expect(getStrokeSettingsValues({ strokeStyle: StrokeStyle.custom })).toMatchObject({
      hasDashes: true,
      isCustom: true,
      isDashed: false,
    });
  });

  it('should offer the miter angle only for the Miter join on an Outside or Center stroke', () => {
    expect(getStrokeSettingsValues({ strokeAlign: StrokeAlign.inside }).isMiter).toBe(false);
    expect(getStrokeSettingsValues({ strokeAlign: StrokeAlign.outside }).isMiter).toBe(true);
    expect(getStrokeSettingsValues({ strokeAlign: StrokeAlign.center }).isMiter).toBe(true);
    expect(getStrokeSettingsValues({ strokeAlign: StrokeAlign.outside, strokeJoin: StrokeJoin.round }).isMiter).toBe(false);
  });
});
