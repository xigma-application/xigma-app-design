// types
import { BlendMode, EffectType, NodeType } from 'types/design/enums';
import { TSceneNode } from 'types/design/types';

// utils
import { isBatchableShape } from '../isBatchableShape';

const createRectangle = (overrides: Record<string, unknown> = {}): TSceneNode =>
  ({
    fills: [{ color: '#ff0000', opacity: 100, type: 'solid' }],
    height: 10,
    id: 'rect',
    name: 'Rectangle',
    parentId: null,
    rotation: 0,
    type: NodeType.rectangle,
    width: 10,
    x: 0,
    y: 0,
    ...overrides,
  }) as unknown as TSceneNode;

const createEllipse = (overrides: Record<string, unknown> = {}): TSceneNode =>
  ({
    fills: [{ color: '#00ff00', opacity: 100, type: 'solid' }],
    height: 10,
    id: 'ellipse',
    name: 'Ellipse',
    parentId: null,
    rotation: 0,
    type: NodeType.ellipse,
    width: 10,
    x: 0,
    y: 0,
    ...overrides,
  }) as unknown as TSceneNode;

describe('isBatchableShape rectangles', () => {
  it('should accept a rectangle with only solid fills', () => {
    // result
    expect(isBatchableShape(createRectangle())).toBe(true);
  });

  it('should reject a node that is neither a rectangle nor an ellipse', () => {
    // result
    expect(isBatchableShape(createRectangle({ type: NodeType.frame }))).toBe(false);
  });

  it('should reject a legacy rectangle without a fills array', () => {
    // result
    expect(isBatchableShape(createRectangle({ fills: undefined }))).toBe(false);
  });

  it.each([
    ['a stroke color', { strokeColor: '#000000', strokeWidth: 2 }],
    ['effects', { effects: [{ type: 'dropShadow' }] }],
    ['a non-solid fill', { fills: [{ opacity: 100, type: 'image' }] }],
    ['a blend mode', { fills: [{ blendMode: 'multiply', color: '#ff0000', opacity: 100, type: 'solid' }] }],
  ])('should reject a rectangle with %s', (_, overrides) => {
    // result
    expect(isBatchableShape(createRectangle(overrides))).toBe(false);
  });

  it.each([
    ['dashed stroke paints', { strokeStyle: 'dashed', strokeWidth: 2, strokes: [{ color: '#000000', opacity: 100, type: 'solid' }] }],
    [
      'a gradient stroke',
      { strokeWidth: 2, strokes: [{ end: { x: 1, y: 1 }, opacity: 100, start: { x: 0, y: 0 }, stops: [], type: 'gradient-linear' }] },
    ],
    ['a stroke blend mode', { strokeWidth: 2, strokes: [{ blendMode: 'multiply', color: '#000000', opacity: 100, type: 'solid' }] }],
    [
      'stroke paints and a legacy stroke color',
      { strokeColor: '#ff0000', strokeWidth: 2, strokes: [{ color: '#000000', opacity: 100, type: 'solid' }] },
    ],
    ['a brush stroke', { strokeMode: 'brush', strokeWidth: 2, strokes: [{ color: '#000000', opacity: 100, type: 'solid' }] }],
    ['single-side strokes', { strokeSides: 'top', strokeWidth: 2, strokes: [{ color: '#000000', opacity: 100, type: 'solid' }] }],
    ['a stroke thicker than half the rectangle', { strokeWidth: 6, strokes: [{ color: '#000000', opacity: 100, type: 'solid' }] }],
  ])('should reject a rectangle with %s', (_, overrides) => {
    // result
    expect(isBatchableShape(createRectangle(overrides))).toBe(false);
  });

  it.each([
    ['solid stroke paints', { strokeWidth: 2, strokes: [{ color: '#000000', opacity: 100, type: 'solid' }] }],
    [
      'an outside solid stroke on a rounded rectangle',
      { cornerRadius: 4, strokeAlign: 'outside', strokeWidth: 3, strokes: [{ color: '#000000', opacity: 100, type: 'solid' }] },
    ],
    [
      'several solid strokes',
      {
        strokeWidth: 2,
        strokes: [
          { color: '#000000', opacity: 100, type: 'solid' },
          { color: '#ffffff', opacity: 50, type: 'solid' },
        ],
      },
    ],
  ])('should accept a rectangle with %s', (_, overrides) => {
    // result
    expect(isBatchableShape(createRectangle(overrides))).toBe(true);
  });

  it.each([
    ['a corner radius', { cornerRadius: 4 }],
    ['a single corner radius', { cornerRadiusTopLeft: 4 }],
    ['corner smoothing', { cornerRadius: 8, cornerSmoothing: 0.6 }],
    ['a zero stroke width', { strokeColor: '#000000', strokeWidth: 0 }],
    ['a stroke width but no stroke paint', { strokeWidth: 2 }],
    ['an empty effects list', { effects: [] }],
  ])('should accept a rectangle with %s', (_, overrides) => {
    // result
    expect(isBatchableShape(createRectangle(overrides))).toBe(true);
  });

  it('should remember the verdict per node object', () => {
    // mock
    const node = createRectangle();

    // before
    const first = isBatchableShape(node);

    (node as unknown as { fills: unknown[] }).fills = [{ opacity: 100, type: 'image' }];

    // result
    expect(first).toBe(true);
    expect(isBatchableShape(node)).toBe(true);
  });
});

describe('isBatchableShape ellipses', () => {
  it('should accept a filled full ellipse', () => {
    // result
    expect(isBatchableShape(createEllipse())).toBe(true);
  });

  it.each([
    ['no fills array', { fills: undefined }],
    ['a gradient fill', { fills: [{ opacity: 100, stops: [], type: 'gradient-linear' }] }],
    ['a blended fill', { fills: [{ blendMode: BlendMode.multiply, color: '#00ff00', opacity: 100, type: 'solid' }] }],
    ['an effect', { effects: [{ type: EffectType.dropShadow }] }],
    ['a stroke', { strokeWidth: 2, strokes: [{ color: '#000000', opacity: 100, type: 'solid' }] }],
    ['an arc', { arcEndAngle: 180, arcStartAngle: 0 }],
    ['a ratio hole', { arcRatio: 0.5 }],
  ])('should reject an ellipse with %s', (_, overrides) => {
    // result
    expect(isBatchableShape(createEllipse(overrides))).toBe(false);
  });

  it('should accept an ellipse whose stroke has no width', () => {
    // result
    expect(isBatchableShape(createEllipse({ strokeWidth: 0, strokes: [{ color: '#000000', opacity: 100, type: 'solid' }] }))).toBe(true);
  });
});
