// types
import { StrokeAlign, StrokeMode } from 'types/design/enums';
import { TAppearanceNode } from 'components/Design/RightPanel/PanelProperties/Common/AppearanceSection/types';

// utils
import { getEffectiveStrokeAlign } from '../getEffectiveStrokeAlign';

const node = (patch: Partial<TAppearanceNode>): TAppearanceNode => patch as TAppearanceNode;

describe('getEffectiveStrokeAlign', () => {
  it('should use the stored align of a basic stroke, inside by default', () => {
    // result
    expect(getEffectiveStrokeAlign(node({}))).toBe(StrokeAlign.inside);
    expect(getEffectiveStrokeAlign(node({ strokeAlign: StrokeAlign.outside, strokeMode: StrokeMode.basic }))).toBe(StrokeAlign.outside);
  });

  it('should center a non-basic stroke', () => {
    // result
    expect(getEffectiveStrokeAlign(node({ strokeAlign: StrokeAlign.outside, strokeMode: StrokeMode.brush }))).toBe(StrokeAlign.center);
  });
});
