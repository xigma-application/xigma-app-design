// types
import { NodeType } from 'types/design/enums';
import { TVectorNode } from 'types/design/types';

// utils
import { getBooleanShape } from '../getBooleanShape';

const makeSquare = (): TVectorNode => ({
  defaultFill: [],
  fillByKey: {},
  filledFaceKeys: [],
  id: 'v',
  name: 'v',
  parentId: null,
  rotation: 0,
  segments: {
    s1: { endId: 'b', id: 's1', startId: 'a', tangentEnd: { x: 0, y: 0 }, tangentStart: { x: 0, y: 0 } },
    s2: { endId: 'c', id: 's2', startId: 'b', tangentEnd: { x: 0, y: 0 }, tangentStart: { x: 0, y: 0 } },
    s3: { endId: 'd', id: 's3', startId: 'c', tangentEnd: { x: 0, y: 0 }, tangentStart: { x: 0, y: 0 } },
    s4: { endId: 'a', id: 's4', startId: 'd', tangentEnd: { x: 0, y: 0 }, tangentStart: { x: 0, y: 0 } },
  },
  strokeColor: '',
  strokeWidth: 0,
  type: NodeType.vector,
  vertexHandleModes: {},
  vertices: { a: { id: 'a', x: 0, y: 0 }, b: { id: 'b', x: 10, y: 0 }, c: { id: 'c', x: 10, y: 20 }, d: { id: 'd', x: 0, y: 20 } },
});

describe('getBooleanShape', () => {
  it('should measure the bounds of the result', () => {
    // action
    const shape = getBooleanShape(makeSquare());

    // result
    expect(shape.bounds).toEqual({ height: 20, width: 10, x: 0, y: 0 });
  });

  it('should reuse the shape for a restyled copy sharing the same geometry', () => {
    // mock
    const vector = makeSquare();

    // action
    const first = getBooleanShape(vector);
    const second = getBooleanShape({ ...vector, strokeColor: '#ff0000' });

    // result
    expect(second).toBe(first);
  });

  it('should give a new shape a new key', () => {
    // action / result
    expect(getBooleanShape(makeSquare()).key).not.toBe(getBooleanShape(makeSquare()).key);
  });
});
