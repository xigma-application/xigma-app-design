// types
import { NodeType, StrokeStyle } from 'types/design/enums';
import { TEllipseNode, TLineNode, TRectangleNode, TVectorNode } from 'types/design/types';

// utils
import { getModeStrokeOutlineLoops } from '../getModeStrokeOutlineLoops';
import { makeSquareVector } from 'utils/canvas/vector/stroke/test/fixtures';

const line = (overrides: Partial<TLineNode> = {}): TLineNode => ({
  height: 0,
  id: 'l',
  name: 'Line',
  parentId: null,
  rotation: 0,
  strokeWidth: 4,
  strokes: [{ color: '#000000', opacity: 100, type: 'solid' }],
  type: NodeType.line,
  width: 100,
  x: 0,
  y: 0,
  ...overrides,
});

const rectangle = (overrides: Partial<TRectangleNode> = {}): TRectangleNode => ({
  fills: [],
  height: 50,
  id: 'r',
  name: 'Rectangle',
  parentId: null,
  rotation: 0,
  strokeColor: '#000000',
  strokeWidth: 4,
  type: NodeType.rectangle,
  width: 100,
  x: 0,
  y: 0,
  ...overrides,
});

describe('getModeStrokeOutlineLoops', () => {
  it('should take a line from its drawn stroke, one loop per dash', () => {
    // result
    expect(getModeStrokeOutlineLoops(line({ strokeDash: 10, strokeGap: 10, strokeStyle: StrokeStyle.dashed }))).toHaveLength(5);
    expect(getModeStrokeOutlineLoops(line())).toHaveLength(1);
    expect(getModeStrokeOutlineLoops(line({ width: 0 }))).toBeNull();
  });

  it('should take a dashed rectangle from its drawn dashes, turned back into its own unrotated frame', () => {
    // before
    const loops =
      getModeStrokeOutlineLoops(rectangle({ rotation: 90, strokeDash: 10, strokeGap: 10, strokeStyle: StrokeStyle.dashed })) ?? [];
    const xs = loops.flat().map((point) => point.x);

    // result
    expect(loops.length).toBeGreaterThan(4);
    expect(Math.max(...xs) - Math.min(...xs)).toBeGreaterThan(90);
  });

  it('should leave a plain rectangle and other shapes to the regular outline', () => {
    // result
    expect(getModeStrokeOutlineLoops(rectangle())).toBeNull();
    expect(getModeStrokeOutlineLoops({ type: NodeType.vector } as TVectorNode)).toBeNull();
    expect(getModeStrokeOutlineLoops({ type: NodeType.ellipse } as TEllipseNode)).toBeNull();
  });

  it('should outline a closed vector by its stroke mode shape', () => {
    // before
    const loops = getModeStrokeOutlineLoops(makeSquareVector({ strokeDash: 10, strokeGap: 10, strokeStyle: StrokeStyle.dashed })) ?? [];

    // result
    expect(loops.length).toBeGreaterThan(4);
  });
});
