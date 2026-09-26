// types
import { TAppearanceNode } from '../../../../../AppearanceSection/types';

// utils
import { getDisabledFillModes } from '../getDisabledFillModes';
import { makeSquareVector } from 'utils/canvas/vector/stroke/test/fixtures';

const rectangle = { type: 'rectangle' } as unknown as TAppearanceNode;

describe('getDisabledFillModes', () => {
  it('should disable crop and tile for several layers', () => {
    // result
    expect(getDisabledFillModes([rectangle, rectangle])).toEqual(['crop', 'tile']);
  });

  it('should disable crop for a single vector', () => {
    // result
    expect(getDisabledFillModes([makeSquareVector()])).toEqual(['crop']);
  });

  it('should disable nothing for a single other layer or no layer', () => {
    // result
    expect(getDisabledFillModes([rectangle])).toBeUndefined();
    expect(getDisabledFillModes([])).toBeUndefined();
  });
});
