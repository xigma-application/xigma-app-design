// utils
import { booleanShape } from './fixtures';
import { getBooleanShapeLayers } from '../getBooleanShapeLayers';

describe('getBooleanShapeLayers', () => {
  it('should draw a plain shape as one even-odd layer', () => {
    // result
    expect(getBooleanShapeLayers(booleanShape)).toEqual([{ fillRule: 'evenOdd', polygons: booleanShape.polygons }]);
  });

  it('should keep the layers a shape brings', () => {
    // mock
    const layers = [{ fillRule: 'nonZero' as const, polygons: [] }];

    // result
    expect(getBooleanShapeLayers({ ...booleanShape, layers })).toBe(layers);
  });
});
