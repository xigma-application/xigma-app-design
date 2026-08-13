// types
import { NodeType } from 'types/design/enums';
import { TTextNode } from 'types/design/types';

// utils
import { flipGlyphVertices } from '../flipGlyphVertices';

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

describe('flipGlyphVertices', () => {
  it('should return the exact same array reference when neither axis is flipped', () => {
    // mock
    const vertices = new Float32Array([10, 5, 0.1, 0.2]);
    const node = buildNode({ flipX: false, flipY: false });

    // result
    expect(flipGlyphVertices(vertices, node)).toBe(vertices);
  });

  it('should mirror x around the node horizontal center when flipX is set, leaving y and uv untouched', () => {
    // mock — node spans x 0..100, so the mirror line is at x=50
    const vertices = new Float32Array([10, 5, 0.25, 0.5, 90, 8, 0.75, 0.125]);
    const node = buildNode({ flipX: true, flipY: false });

    // result
    expect(Array.from(flipGlyphVertices(vertices, node))).toEqual([90, 5, 0.25, 0.5, 10, 8, 0.75, 0.125]);
  });

  it('should mirror y around the node vertical center when flipY is set, leaving x and uv untouched', () => {
    // mock — node spans y 0..20, so the mirror line is at y=10
    const vertices = new Float32Array([10, 5, 0.25, 0.5, 90, 18, 0.75, 0.125]);
    const node = buildNode({ flipX: false, flipY: true });

    // result
    expect(Array.from(flipGlyphVertices(vertices, node))).toEqual([10, 15, 0.25, 0.5, 90, 2, 0.75, 0.125]);
  });

  it('should mirror both axes at once when flipX and flipY are both set', () => {
    // mock
    const vertices = new Float32Array([10, 5, 0.25, 0.5]);
    const node = buildNode({ flipX: true, flipY: true });

    // result — x mirrors around 50, y mirrors around 10
    expect(Array.from(flipGlyphVertices(vertices, node))).toEqual([90, 15, 0.25, 0.5]);
  });
});
