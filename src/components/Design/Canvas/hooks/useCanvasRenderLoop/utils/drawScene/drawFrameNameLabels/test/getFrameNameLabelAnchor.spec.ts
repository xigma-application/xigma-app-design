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

  it('should shrink the world-space gap as zoom increases, keeping it constant on screen', () => {
    // before
    const { point } = getFrameNameLabelAnchor(buildFrame(), 2);

    // result
    expect(point).toEqual({ x: 10, y: 20 - (FRAME_NAME_LABEL_FONT_SIZE_PX + FRAME_NAME_LABEL_GAP_PX) / 2 });
  });

  it('should rotate the anchor around the node centre for a rotated frame', () => {
    // before — a square frame rotated 90°: the top-left corner swings to the bottom-left
    const node = buildFrame({ height: 100, rotation: 90, width: 100, x: 0, y: 0 });

    const { angleDeg, point } = getFrameNameLabelAnchor(node, 1);

    // result
    expect(angleDeg).toBe(90);
    expect(point.x).toBeCloseTo(100 + (FRAME_NAME_LABEL_FONT_SIZE_PX + FRAME_NAME_LABEL_GAP_PX), 5);
    expect(point.y).toBeCloseTo(0, 5);
  });
});
