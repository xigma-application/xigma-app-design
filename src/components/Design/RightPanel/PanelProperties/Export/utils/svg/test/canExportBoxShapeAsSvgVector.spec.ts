// types
import { BlendMode, EffectType, NodeType, StrokeMode } from 'types/design/enums';
import { TFrameNode, TRectangleNode } from 'types/design/types';
import { TGradientPaint, TPaint } from 'types/design/paint/types';

// utils
import { canExportBoxShapeAsSvgVector } from '../canExportBoxShapeAsSvgVector';

const solid: TPaint = { color: '#ff0000', opacity: 100, type: 'solid' };
const image: TPaint = { opacity: 100, ref: 'img', rotation: 0, scaleMode: 'fill', type: 'image' };
const video: TPaint = { opacity: 100, ref: 'vid', rotation: 0, scaleMode: 'fill', type: 'video' };
const linearGradient: TGradientPaint = {
  end: { x: 10, y: 10 },
  opacity: 100,
  start: { x: 0, y: 0 },
  stops: [
    { color: '#ff0000', opacity: 100, position: 0 },
    { color: '#0000ff', opacity: 100, position: 1 },
  ],
  type: 'gradient-linear',
};

const rectangle = (overrides: Partial<TRectangleNode> = {}): TRectangleNode => ({
  fills: [solid],
  height: 10,
  id: 'r',
  name: 'r',
  parentId: null,
  rotation: 0,
  type: NodeType.rectangle,
  width: 10,
  x: 0,
  y: 0,
  ...overrides,
});

const check = (node: TRectangleNode | TFrameNode): boolean => canExportBoxShapeAsSvgVector(node, {});

describe('canExportBoxShapeAsSvgVector', () => {
  it('should allow a plain solid rectangle', () => {
    expect(check(rectangle())).toBe(true);
  });

  it('should allow solid strokes and ignore hidden non-solid paints', () => {
    expect(check(rectangle({ strokeWidth: 2, strokes: [solid] }))).toBe(true);
    expect(check(rectangle({ fills: [solid, { ...image, visible: false }] }))).toBe(true);
    expect(check(rectangle({ strokeMode: StrokeMode.basic }))).toBe(true);
  });

  it('should allow simple image and video fills, but still reject them as a drawn stroke', () => {
    expect(check(rectangle({ fills: [image] }))).toBe(true);
    expect(check(rectangle({ fills: [video] }))).toBe(true);
    expect(check(rectangle({ strokeWidth: 2, strokes: [image] }))).toBe(false);
  });

  it('should reject an image fill with no ref, non-default color adjustments, or a blend mode', () => {
    expect(check(rectangle({ fills: [{ ...image, ref: '' }] }))).toBe(false);
    expect(
      check(
        rectangle({
          fills: [
            { ...image, adjustments: { contrast: 0, exposure: 10, highlights: 0, saturation: 0, shadows: 0, temperature: 0, tint: 0 } },
          ],
        }),
      ),
    ).toBe(false);
    expect(
      check(
        rectangle({
          fills: [
            { ...image, adjustments: { contrast: 0, exposure: 0, highlights: 0, saturation: 0, shadows: 0, temperature: 0, tint: 0 } },
          ],
        }),
      ),
    ).toBe(true);
    expect(check(rectangle({ fills: [{ ...image, blendMode: BlendMode.multiply }] }))).toBe(false);
  });

  it('should allow linear and radial gradient fills', () => {
    expect(check(rectangle({ fills: [linearGradient] }))).toBe(true);
    expect(check(rectangle({ fills: [{ ...linearGradient, type: 'gradient-radial' }] }))).toBe(true);
  });

  it('should allow angular and diamond gradient fills (approximated as vector sectors/rings)', () => {
    expect(check(rectangle({ fills: [{ ...linearGradient, type: 'gradient-angular' }] }))).toBe(true);
    expect(check(rectangle({ fills: [{ ...linearGradient, type: 'gradient-diamond' }] }))).toBe(true);
  });

  it('should ignore stroke paints that are not drawn because the width is zero', () => {
    expect(check(rectangle({ strokes: [image] }))).toBe(true);
  });

  it('should reject paints with a blend mode', () => {
    expect(check(rectangle({ fills: [{ ...solid, blendMode: BlendMode.multiply }] }))).toBe(false);
    expect(check(rectangle({ fills: [{ ...solid, blendMode: BlendMode.normal }] }))).toBe(true);
  });

  it('should reject a hidden or blended node', () => {
    expect(check(rectangle({ hidden: true }))).toBe(false);
    expect(check(rectangle({ blendMode: BlendMode.screen }))).toBe(false);
    expect(check(rectangle({ blendMode: BlendMode.normal }))).toBe(true);
  });

  it('should reject visible effects but allow hidden ones', () => {
    const effect = { blur: 4, color: '#000000', opacity: 50, spread: 0, type: EffectType.dropShadow, x: 0, y: 2 };

    expect(check(rectangle({ effects: [effect] }))).toBe(false);
    expect(check(rectangle({ effects: [{ ...effect, visible: false }] }))).toBe(true);
  });

  it('should reject legacy strokes and brush stroke mode', () => {
    expect(check(rectangle({ strokeColor: '#000000', strokeWidth: 2 }))).toBe(false);
    expect(check(rectangle({ strokeMode: StrokeMode.brush }))).toBe(false);
  });

  it('should reject a node whose ancestor is unsafe', () => {
    const parent: TFrameNode = {
      childIds: ['r'],
      clipContent: true,
      fills: [],
      height: 5,
      id: 'p',
      name: 'p',
      parentId: null,
      rotation: 0,
      type: NodeType.frame,
      width: 5,
      x: 0,
      y: 0,
    };

    expect(canExportBoxShapeAsSvgVector(rectangle({ parentId: 'p' }), { p: parent })).toBe(false);
  });
});
