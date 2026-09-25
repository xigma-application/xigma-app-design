// types
import { StrokeBrushDirection, StrokeMode, StrokeProfile } from 'types/design/enums';

// utils
import { getLineVectorStrokeSettings } from '../getLineVectorStrokeSettings';
import { makeLine } from '../stroke/test/fixtures';

describe('getLineVectorStrokeSettings', () => {
  it('should copy the stroke mode settings the line has set', () => {
    // before
    const settings = getLineVectorStrokeSettings(
      makeLine({
        strokeBrush: 'brush-1',
        strokeBrushDirection: StrokeBrushDirection.left,
        strokeMode: StrokeMode.brush,
        strokeProfile: StrokeProfile.taper,
      }),
    );

    // result
    expect(settings).toEqual({
      strokeBrush: 'brush-1',
      strokeBrushDirection: StrokeBrushDirection.left,
      strokeMode: StrokeMode.brush,
      strokeProfile: StrokeProfile.taper,
    });
  });

  it('should copy nothing from a plain line', () => {
    // result
    expect(getLineVectorStrokeSettings(makeLine())).toEqual({});
  });
});
