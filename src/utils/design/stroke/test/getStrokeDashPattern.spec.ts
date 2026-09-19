// types
import { StrokeStyle } from 'types/design/enums';

// utils
import { getStrokeDashPattern } from '../getStrokeDashPattern';

describe('getStrokeDashPattern', () => {
  it('should return null for a solid or unset style', () => {
    expect(getStrokeDashPattern({})).toBeNull();
    expect(getStrokeDashPattern({ strokeDash: 10, strokeStyle: StrokeStyle.solid })).toBeNull();
  });

  it('should use Dash and Gap for the dashed style, with Gap following Dash until it is set', () => {
    expect(getStrokeDashPattern({ strokeStyle: StrokeStyle.dashed })).toEqual([20, 20]);
    expect(getStrokeDashPattern({ strokeDash: 8, strokeStyle: StrokeStyle.dashed })).toEqual([8, 8]);
    expect(getStrokeDashPattern({ strokeDash: 8, strokeGap: 3, strokeStyle: StrokeStyle.dashed })).toEqual([8, 3]);
  });

  it('should use the custom dashes, repeating an odd list so it pairs up', () => {
    expect(getStrokeDashPattern({ strokeStyle: StrokeStyle.custom })).toEqual([20, 40, 60, 80]);
    expect(getStrokeDashPattern({ strokeDashes: [10, 20, 30], strokeStyle: StrokeStyle.custom })).toEqual([10, 20, 30, 10, 20, 30]);
  });

  it('should return null when the pattern has no length at all', () => {
    expect(getStrokeDashPattern({ strokeDash: 0, strokeGap: 0, strokeStyle: StrokeStyle.dashed })).toBeNull();
  });
});
