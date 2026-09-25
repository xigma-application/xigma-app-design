// types
import { BlendMode, EffectType, NodeType } from 'types/design/enums';
import { TPaint } from 'types/design/paint/types';
import { TEffect, TEllipseNode, TFrameNode } from 'types/design/types';

// utils
import { canExportEllipseAsSvgVector } from '../canExportEllipseAsSvgVector';

const ellipse = (overrides: Partial<TEllipseNode> = {}): TEllipseNode => ({
  fills: [{ color: '#ff0000', opacity: 100, type: 'solid' }],
  height: 10,
  id: 'e',
  name: 'e',
  parentId: null,
  rotation: 0,
  type: NodeType.ellipse,
  width: 10,
  x: 0,
  y: 0,
  ...overrides,
});

const check = (node: TEllipseNode): boolean => canExportEllipseAsSvgVector(node, {});

describe('canExportEllipseAsSvgVector', () => {
  it('should allow a plain ellipse', () => {
    expect(check(ellipse())).toBe(true);
  });

  it('should reject a hidden or blended node', () => {
    expect(check(ellipse({ hidden: true }))).toBe(false);
    expect(check(ellipse({ blendMode: BlendMode.screen }))).toBe(false);
    expect(check(ellipse({ blendMode: BlendMode.normal }))).toBe(true);
  });

  it('should reject a node whose ancestor is unsafe', () => {
    const parent: TFrameNode = {
      childIds: ['e'],
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

    expect(canExportEllipseAsSvgVector(ellipse({ parentId: 'p' }), { p: parent })).toBe(false);
  });

  it('should reject visible effects and paints the export cannot draw', () => {
    expect(check(ellipse({ effects: [{ blur: 4, color: '#000000', type: EffectType.dropShadow, visible: true } as TEffect] }))).toBe(false);
    expect(check(ellipse({ fills: [{ opacity: 100, sourceNodeId: 'x', type: 'pattern' } as unknown as TPaint] }))).toBe(false);
    expect(check(ellipse({ strokeWidth: 2, strokes: [{ opacity: 100, sourceNodeId: 'x', type: 'pattern' } as unknown as TPaint] }))).toBe(
      false,
    );
    expect(check(ellipse({ strokeWidth: 2, strokes: [{ color: '#000000', opacity: 100, type: 'solid' }] }))).toBe(true);
  });
});
