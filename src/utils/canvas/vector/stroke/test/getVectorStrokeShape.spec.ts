// types
import { NodeType, StrokeMode, StrokeProfile, StrokeStyle } from 'types/design/enums';
import { TVectorNode } from 'types/design/types';

// utils
import { getVectorStrokeShape } from '../getVectorStrokeShape';
import { makeSquareVector } from './fixtures';

const openVector: TVectorNode = {
  defaultFill: null,
  filledFaceKeys: [],
  id: 'open',
  name: 'Vector',
  parentId: null,
  rotation: 0,
  segments: { s1: { endId: 'b', id: 's1', startId: 'a', tangentEnd: null, tangentStart: null } },
  strokeColor: '#000000',
  strokeMode: StrokeMode.dynamic,
  strokeWidth: 4,
  type: NodeType.vector,
  vertexHandleModes: {},
  vertices: { a: { id: 'a', x: 0, y: 0 }, b: { id: 'b', x: 100, y: 0 } },
};

describe('getVectorStrokeShape', () => {
  it('should draw a closed path in its stroke mode filled even-odd', () => {
    // before
    const shape = getVectorStrokeShape(makeSquareVector({ strokeMode: StrokeMode.dynamic }));

    // result
    expect(shape?.fillRule).toBe('evenOdd');
    expect(shape?.polygons.length).toBeGreaterThan(0);
  });

  it('should reuse the shape for the same node', () => {
    // mock
    const node = makeSquareVector({ strokeStyle: StrokeStyle.dashed });

    // result
    expect(getVectorStrokeShape(node)).toBe(getVectorStrokeShape(node));
  });

  it('should draw a profiled closed path', () => {
    // result
    expect(getVectorStrokeShape(makeSquareVector({ strokeProfile: StrokeProfile.wedge }))?.polygons).toHaveLength(2);
  });

  it('should leave a plain stroke to the regular drawing', () => {
    // result
    expect(getVectorStrokeShape(makeSquareVector())).toBeNull();
  });

  it('should leave a solid stroke without a width profile to the regular drawing', () => {
    // result
    expect(getVectorStrokeShape(makeSquareVector({ strokeProfile: StrokeProfile.uniform, strokeStyle: StrokeStyle.solid }))).toBeNull();
  });

  it('should leave an open path to the regular drawing', () => {
    // result
    expect(getVectorStrokeShape(openVector)).toBeNull();
  });

  it('should draw nothing special without a stroke width', () => {
    // result
    expect(getVectorStrokeShape(makeSquareVector({ strokeMode: StrokeMode.brush, strokeWidth: 0 }))).toBeNull();
  });
});
