// types
import { BooleanOperation, NodeType, StrokeMode } from 'types/design/enums';
import { TBooleanNode } from 'types/design/types';

// utils
import { booleanShape } from './fixtures';
import { getBooleanStrokeModePolygons } from '../getBooleanStrokeModePolygons';

const node = (overrides: Partial<TBooleanNode> = {}): TBooleanNode => ({
  booleanOperation: BooleanOperation.union,
  childIds: [],
  fills: [],
  height: 100,
  id: 'union',
  name: 'Union',
  parentId: null,
  rotation: 0,
  strokeWidth: 8,
  type: NodeType.boolean,
  width: 150,
  x: 10,
  y: 20,
  ...overrides,
});

describe('getBooleanStrokeModePolygons', () => {
  it('should leave a basic stroke to the plain rings', () => {
    // result
    expect(getBooleanStrokeModePolygons(node(), booleanShape, 8)).toBeNull();
  });

  it('should wiggle both edges of every loop for a dynamic stroke', () => {
    // before
    const polygons = getBooleanStrokeModePolygons(node({ strokeMode: StrokeMode.dynamic }), booleanShape, 8) ?? [];

    // result
    expect(polygons).toHaveLength(2);
    expect(polygons[0].length).toBeGreaterThan(4);
  });

  it('should fall back to the plain ring edges when a dynamic stroke has no frequency', () => {
    // result
    expect(getBooleanStrokeModePolygons(node({ strokeDynamicFrequency: 0, strokeMode: StrokeMode.dynamic }), booleanShape, 8)).toHaveLength(
      2,
    );
  });

  it('should run the brush around every loop', () => {
    // before
    const polygons = getBooleanStrokeModePolygons(node({ strokeMode: StrokeMode.brush }), booleanShape, 8) ?? [];

    // result
    expect(polygons.length).toBeGreaterThan(1);
    expect(polygons[0].length).toBeGreaterThan(50);
  });

  it('should reuse the polygons for the same node and shape, and redo them for a new shape', () => {
    // mock
    const dynamic = node({ strokeMode: StrokeMode.dynamic });
    const first = getBooleanStrokeModePolygons(dynamic, booleanShape, 8);

    // result
    expect(getBooleanStrokeModePolygons(dynamic, booleanShape, 8)).toBe(first);
    expect(getBooleanStrokeModePolygons(dynamic, { ...booleanShape }, 8)).not.toBe(first);
  });
});
