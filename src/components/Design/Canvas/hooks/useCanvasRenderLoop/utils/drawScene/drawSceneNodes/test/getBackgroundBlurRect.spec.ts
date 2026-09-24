// types
import { NodeType } from 'types/design/enums';
import { TMaskRenderer } from '../types';
import { TRectangleNode } from 'types/design/types';

// utils
import { getBackgroundBlurRect } from '../getBackgroundBlurRect';

const node: TRectangleNode = {
  fills: [],
  height: 40,
  id: 'r1',
  name: 'Rectangle',
  parentId: null,
  rotation: 0,
  type: NodeType.rectangle,
  width: 60,
  x: 100,
  y: 100,
};

const renderer = {
  context: { canvasWidth: 1000, viewport: { x: 0, y: 0, zoom: 1 } },
  gl: { drawingBufferHeight: 1000, drawingBufferWidth: 1000 },
} as unknown as TMaskRenderer;

describe('getBackgroundBlurRect', () => {
  it('should cover the node plus twice the blur radius and a small padding on every side', () => {
    // before
    const rect = getBackgroundBlurRect(renderer, node, 5);

    // result
    expect(rect).toMatchObject({ height: 40 + 28, width: 60 + 28, x: 100 - 14 });
  });

  it('should flag a node outside the canvas as off screen', () => {
    // result
    expect(getBackgroundBlurRect(renderer, { ...node, x: 5000 }, 5).offscreen).toBe(true);
  });

  it('should treat a node without a rotation as unrotated', () => {
    // mock
    const withoutRotation: Record<string, unknown> = { ...node };

    delete withoutRotation.rotation;

    // before
    const rect = getBackgroundBlurRect(renderer, withoutRotation as unknown as TRectangleNode, 5);

    // result
    expect(rect).toMatchObject({ height: 40 + 28, width: 60 + 28 });
  });
});
