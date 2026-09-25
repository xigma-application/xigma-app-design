// types
import { BlendMode, NodeType } from 'types/design/enums';
import { TFrameNode, TSceneNode } from 'types/design/types';
import { TMaskRenderer } from '../types';

// utils
import { getLineBoxFromPoints } from 'utils/canvas/line/getLineBoxFromPoints';
import { canSkipFrameClip } from '../canSkipFrameClip';

const subtreeMock = vi.fn();

vi.mock('../getIsolatedSubtree', () => ({ getIsolatedSubtree: (...args: unknown[]): unknown => subtreeMock(...args) }));
vi.mock('../hasRealBlendMode', () => ({
  hasRealBlendMode: (node: { blendMode?: BlendMode }): boolean => node.blendMode === BlendMode.multiply,
}));

const renderer = { refs: {} } as TMaskRenderer;

const frame = (extra: Partial<TFrameNode> = {}): TFrameNode =>
  ({ childIds: [], height: 100, id: 'f', rotation: 0, type: NodeType.frame, width: 100, x: 0, y: 0, ...extra }) as TFrameNode;

const child = (x: number, y: number, extra: object = {}): TSceneNode =>
  ({ height: 10, id: `c-${x}-${y}`, rotation: 0, type: NodeType.rectangle, width: 10, x, y, ...extra }) as TSceneNode;

const canSkip = (children: TSceneNode[], frameExtra: Partial<TFrameNode> = {}): boolean => {
  subtreeMock.mockReturnValue(children);

  return canSkipFrameClip(renderer, frame(frameExtra));
};

describe('canSkipFrameClip', () => {
  it('should skip the clip when every child sits well inside the frame', () => {
    // result
    expect(canSkip([child(30, 30), child(50, 50, { effects: [{ visible: false }], strokeWidth: undefined })])).toBe(true);
    expect(canSkip([child(30, 30, { effects: undefined, strokeWidth: 2 })])).toBe(true);
  });

  it('should keep the clip for a rotated frame or when the subtree cannot be isolated', () => {
    // result
    expect(canSkip([child(30, 30)], { rotation: 45 })).toBe(false);
    subtreeMock.mockReturnValue(null);
    expect(canSkipFrameClip(renderer, frame())).toBe(false);
  });

  it('should keep the clip for a child with a visible effect or a real blend mode', () => {
    // result
    expect(canSkip([child(30, 30, { effects: [{ type: 'dropShadow' }] })])).toBe(false);
    expect(canSkip([child(30, 30, { blendMode: BlendMode.multiply })])).toBe(false);
  });

  it('should keep the clip for a child crossing any frame edge', () => {
    // result
    expect(canSkip([child(-5, 30)])).toBe(false);
    expect(canSkip([child(30, -5)])).toBe(false);
    expect(canSkip([child(95, 30)])).toBe(false);
    expect(canSkip([child(30, 95)])).toBe(false);
  });

  it('should keep the clip for a child poking out of a rounded corner, and skip it for one inside the curve', () => {
    // result
    expect(canSkip([child(2, 2)], { cornerRadius: 20 })).toBe(false);
    expect(canSkip([child(8, 8)], { cornerRadius: 20 })).toBe(true);
    expect(canSkip([child(88, 2)], { cornerRadiusTopRight: 20 })).toBe(false);
    expect(canSkip([child(2, 88)], { cornerRadiusBottomLeft: 20 })).toBe(false);
    expect(canSkip([child(88, 88)], { cornerRadiusBottomRight: 20 })).toBe(false);
    expect(canSkip([child(2, 2)], { cornerRadius: 20, cornerRadiusTopLeft: 0 })).toBe(true);
  });

  it('should measure children without a rotation', () => {
    // result
    expect(canSkip([{ id: 'line', type: NodeType.line, ...getLineBoxFromPoints({ x1: 30, x2: 40, y1: 30, y2: 40 }) } as TSceneNode])).toBe(
      true,
    );
  });
});
