// types
import { StrokeAlign, StrokeJoin } from 'types/design/enums';

// utils
import { getBoxStrokePolygons } from '../../getBoxStrokePolygons';
import { getUniformRingPolygons } from '../getUniformRingPolygons';
import { rect } from './nodeFixture';

describe('getUniformRingPolygons', () => {
  it('should be the plain ring at the node alignment and width', () => {
    // before
    const node = rect();

    // result
    expect(getUniformRingPolygons(node)).toEqual(getBoxStrokePolygons(node, { bottom: 4, left: 4, right: 4, top: 4 }, StrokeAlign.inside));
  });

  it('should apply the join of the node', () => {
    // before
    const node = rect({ strokeAlign: StrokeAlign.outside, strokeJoin: StrokeJoin.round });

    // result
    expect(getUniformRingPolygons(node)).not.toEqual(getUniformRingPolygons(rect({ strokeAlign: StrokeAlign.outside })));
  });
});
