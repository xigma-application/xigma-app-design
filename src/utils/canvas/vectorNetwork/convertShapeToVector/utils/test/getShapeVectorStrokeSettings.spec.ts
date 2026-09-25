// types
import { NodeType, StrokeAlign, StrokeMode } from 'types/design/enums';
import { TRectangleNode } from 'types/design/types';

// utils
import { getShapeVectorStrokeSettings } from '../getShapeVectorStrokeSettings';

const makeRectangle = (overrides: Partial<TRectangleNode> = {}): TRectangleNode =>
  ({
    fills: [],
    height: 100,
    id: 'rectangle',
    name: 'Rectangle',
    parentId: null,
    rotation: 0,
    type: NodeType.rectangle,
    width: 100,
    x: 0,
    y: 0,
    ...overrides,
  }) as TRectangleNode;

describe('getShapeVectorStrokeSettings', () => {
  it('should carry the stroke color, weight, position and mode over to the vector', () => {
    // before
    const settings = getShapeVectorStrokeSettings(
      makeRectangle({
        strokeAlign: StrokeAlign.outside,
        strokeMode: StrokeMode.dynamic,
        strokeWidth: 4,
        strokes: [{ color: '#ff0000', opacity: 100, type: 'solid' }],
      }),
    );

    // result
    expect(settings).toEqual({ strokeAlign: StrokeAlign.outside, strokeColor: '#ff0000', strokeMode: StrokeMode.dynamic, strokeWidth: 4 });
  });

  it('should default the position to inside', () => {
    // before
    const settings = getShapeVectorStrokeSettings(
      makeRectangle({ strokeWidth: 2, strokes: [{ color: '#00ff00', opacity: 100, type: 'solid' }] }),
    );

    // result
    expect(settings.strokeAlign).toBe(StrokeAlign.inside);
  });

  it('should carry nothing without a visible stroke paint', () => {
    // result
    expect(getShapeVectorStrokeSettings(makeRectangle({ strokeWidth: 2 }))).toEqual({});
  });

  it('should carry nothing without a stroke weight', () => {
    // result
    expect(getShapeVectorStrokeSettings(makeRectangle({ strokes: [{ color: '#00ff00', opacity: 100, type: 'solid' }] }))).toEqual({});
  });
});
