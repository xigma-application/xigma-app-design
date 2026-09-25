// types
import { NodeType } from 'types/design/enums';
import { TRectangleNode, TVectorNode } from 'types/design/types';

// utils
import { convertNodeToVector } from '../convertShapeToVector/convertNodeToVector';
import { getNestedUnfilledLoopKeys } from '../getNestedUnfilledLoopKeys';

const squareVector = (id: string, x: number, size: number): TVectorNode =>
  convertNodeToVector({
    fills: [],
    height: size,
    id,
    name: id,
    parentId: null,
    rotation: 0,
    type: NodeType.rectangle,
    width: size,
    x,
    y: x,
  } as TRectangleNode);

const merge = (filled: TVectorNode, ...unfilled: TVectorNode[]): TVectorNode => ({
  ...filled,
  segments: Object.assign({}, filled.segments, ...unfilled.map((node) => node.segments)),
  vertices: Object.assign({}, filled.vertices, ...unfilled.map((node) => node.vertices)),
});

const outer = squareVector('outer', 0, 100);
const containing = [
  { x: 0, y: 0 },
  { x: 100, y: 0 },
  { x: 100, y: 100 },
  { x: 0, y: 100 },
];

describe('getNestedUnfilledLoopKeys', () => {
  it('should return the unfilled loops lying inside the containing face', () => {
    // mock
    const inner = squareVector('inner', 20, 20);

    // before
    const keys = getNestedUnfilledLoopKeys(merge(outer, inner), containing);

    // result
    expect(keys).toHaveLength(1);
    expect(keys[0]).not.toBe(outer.filledFaceKeys[0]);
  });

  it('should skip unfilled loops outside the face or bigger than it', () => {
    // mock
    const outside = squareVector('outside', 300, 20);
    const bigger = squareVector('bigger', -50, 300);

    // result
    expect(getNestedUnfilledLoopKeys(merge(outer, outside, bigger), containing)).toEqual([]);
  });
});
