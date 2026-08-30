// others
import { FRAME_NAME_LABEL_FONT_SIZE_PX, FRAME_NAME_LABEL_GAP_PX } from 'constant/canvas';

// types
import { NodeType } from 'types/design/enums';
import { TFrameNode } from 'types/design/types';

// utils
import { getFrameNameLabelAnchor } from '../getFrameNameLabelAnchor';

const buildFrame = (overrides: Partial<TFrameNode> = {}): TFrameNode => ({
  fill: '#ffffff',
  height: 100,
  id: 'frame-1',
  name: 'Frame 1',
  parentId: null,
  rotation: 0,
  type: NodeType.frame,
  width: 200,
  x: 10,
  y: 20,
  ...overrides,
});

describe('getFrameNameLabelAnchor', () => {
  it('should place the anchor above the top-left corner at zoom 1, unrotated', () => {
    // before
    const { angleDeg, point } = getFrameNameLabelAnchor(buildFrame(), 1);

    // result
    expect(angleDeg).toBe(0);
    expect(point).toEqual({ x: 10, y: 20 - (FRAME_NAME_LABEL_FONT_SIZE_PX + FRAME_NAME_LABEL_GAP_PX) });
  });

  it('should cap the label at the frame’s width when anchored to its top or bottom edge', () => {
    // result
    expect(getFrameNameLabelAnchor(buildFrame({ height: 100, width: 200 }), 1).maxWidth).toBe(200);
  });

  it('should cap the label at the frame’s height once rotation snaps it to a side edge', () => {
    // before — past the 45° threshold, the label anchors to what used to be the left edge, whose
    // available run is the frame's height, not its width
    const node = buildFrame({ height: 100, rotation: 90, width: 200, x: 0, y: 0 });

    // result
    expect(getFrameNameLabelAnchor(node, 1).maxWidth).toBe(100);
  });

  it('should shrink the world-space gap as zoom increases, keeping it constant on screen', () => {
    // before
    const { point } = getFrameNameLabelAnchor(buildFrame(), 2);

    // result
    expect(point).toEqual({ x: 10, y: 20 - (FRAME_NAME_LABEL_FONT_SIZE_PX + FRAME_NAME_LABEL_GAP_PX) / 2 });
  });

  it('should keep the label upright on a rotated square by snapping to whichever corner is now topmost', () => {
    // before — a square rotated 90° is visually identical to its unrotated self, so the corner
    // that was bottom-left swings up to occupy the same top-left spot the label already used
    const node = buildFrame({ height: 100, rotation: 90, width: 100, x: 0, y: 0 });

    const { angleDeg, point } = getFrameNameLabelAnchor(node, 1);

    // result
    expect(angleDeg).toBeCloseTo(0, 5);
    expect(point.x).toBeCloseTo(0, 5);
    expect(point.y).toBeCloseTo(-(FRAME_NAME_LABEL_FONT_SIZE_PX + FRAME_NAME_LABEL_GAP_PX), 5);
  });

  it('should never rotate the label itself past a quarter turn, snapping to the next corner instead', () => {
    // before — a 200x100 rectangle rotated 90° stands up as a 100x200 shape; its new top edge is
    // the corner that used to be its bottom-left, and the label stays perfectly horizontal above it
    const node = buildFrame({ height: 100, rotation: 90, width: 200, x: 0, y: 0 });

    const { angleDeg, point } = getFrameNameLabelAnchor(node, 1);

    // result
    expect(angleDeg).toBeCloseTo(0, 5);
    expect(point.x).toBeCloseTo(50, 5);
    expect(point.y).toBeCloseTo(-(50 + FRAME_NAME_LABEL_FONT_SIZE_PX + FRAME_NAME_LABEL_GAP_PX), 5);
  });

  it('should track the frame smoothly for rotations under the 45° snap threshold', () => {
    // before
    const node = buildFrame({ height: 100, rotation: 30, width: 100, x: 0, y: 0 });

    const { angleDeg } = getFrameNameLabelAnchor(node, 1);

    // result — still anchored to the original top-left corner, so the label simply follows the
    // frame's own rotation
    expect(angleDeg).toBeCloseTo(30, 5);
  });
});
