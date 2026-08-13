// types
import { NodeType } from 'types/design/enums';
import { TTextNode } from 'types/design/types';

// utils
import { flipTextPoint } from '../flipTextPoint';

const buildNode = (overrides: Partial<TTextNode> = {}): TTextNode => ({
  content: 'A',
  fill: '#ffffff',
  flipX: false,
  flipY: false,
  fontFamily: 'Inter',
  fontSize: 14,
  height: 20,
  id: 'a',
  name: 'Text',
  parentId: null,
  rotation: 0,
  type: NodeType.text,
  width: 100,
  x: 0,
  y: 0,
  ...overrides,
});

describe('flipTextPoint', () => {
  it('should return the point unchanged when neither axis is flipped', () => {
    // result
    expect(flipTextPoint({ x: 10, y: 5 }, buildNode())).toEqual({ x: 10, y: 5 });
  });

  it('should mirror x around the node horizontal center when flipX is set', () => {
    // mock — node spans x 0..100, so the mirror line is at x=50
    const node = buildNode({ flipX: true });

    // result
    expect(flipTextPoint({ x: 10, y: 5 }, node)).toEqual({ x: 90, y: 5 });
  });

  it('should mirror y around the node vertical center when flipY is set', () => {
    // mock — node spans y 0..20, so the mirror line is at y=10
    const node = buildNode({ flipY: true });

    // result
    expect(flipTextPoint({ x: 10, y: 5 }, node)).toEqual({ x: 10, y: 15 });
  });

  it('should be its own inverse — flipping a point twice returns the original', () => {
    // mock
    const node = buildNode({ flipX: true, flipY: true });
    const original = { x: 37, y: 3 };

    // result
    expect(flipTextPoint(flipTextPoint(original, node), node)).toEqual(original);
  });
});
