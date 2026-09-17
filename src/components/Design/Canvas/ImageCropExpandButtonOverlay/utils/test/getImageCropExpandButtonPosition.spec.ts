// utils
import { getImageCropExpandButtonPosition } from '../getImageCropExpandButtonPosition';

// types
import { NodeType } from 'types/design/enums';
import { TRectangleNode, TSceneNode } from 'types/design/types';

const IDENTITY_VIEWPORT = { x: 0, y: 0, zoom: 1 };
const INSET = 17; // BUTTON_SIZE_PX / 2 + EDGE_OFFSET_PX == 24 / 2 + 5

const rectangle: TRectangleNode = {
  fills: [],
  height: 100,
  id: 'rect-1',
  name: 'Rectangle',
  parentId: null,
  rotation: 0,
  type: NodeType.rectangle,
  width: 200,
  x: 0,
  y: 0,
};

const nodes: Record<string, TSceneNode> = { 'rect-1': rectangle };

describe('getImageCropExpandButtonPosition', () => {
  it('should return null when there is no active image editor', () => {
    expect(getImageCropExpandButtonPosition(null, nodes, IDENTITY_VIEWPORT)).toBeNull();
  });

  it('should return null when the editor is active but not in crop mode', () => {
    expect(getImageCropExpandButtonPosition({ mode: 'position', nodeId: 'rect-1', paintIndex: 0 }, nodes, IDENTITY_VIEWPORT)).toBeNull();
    expect(getImageCropExpandButtonPosition({ mode: 'tile', nodeId: 'rect-1', paintIndex: 0 }, nodes, IDENTITY_VIEWPORT)).toBeNull();
  });

  it('should return null when the targeted node is not an appearance node (no fills/crop concept)', () => {
    const line = { id: 'line-1', name: 'Line', parentId: null, stroke: '#000', type: NodeType.line, x1: 0, x2: 10, y1: 0, y2: 10 };

    expect(
      getImageCropExpandButtonPosition({ mode: 'crop', nodeId: 'line-1', paintIndex: 0 }, { 'line-1': line as never }, IDENTITY_VIEWPORT),
    ).toBeNull();
  });

  it('should sit inset from the frame edges near the bottom-right corner, for an unrotated node at the identity viewport', () => {
    const position = getImageCropExpandButtonPosition({ mode: 'crop', nodeId: 'rect-1', paintIndex: 0 }, nodes, IDENTITY_VIEWPORT);

    expect(position?.x).toBeCloseTo(200 - INSET);
    expect(position?.y).toBeCloseTo(100 - INSET);
  });

  it('should keep the inset a constant screen distance regardless of zoom', () => {
    const zoomedOut = getImageCropExpandButtonPosition({ mode: 'crop', nodeId: 'rect-1', paintIndex: 0 }, nodes, {
      ...IDENTITY_VIEWPORT,
      zoom: 1,
    });
    const zoomedIn = getImageCropExpandButtonPosition({ mode: 'crop', nodeId: 'rect-1', paintIndex: 0 }, nodes, {
      ...IDENTITY_VIEWPORT,
      zoom: 2,
    });

    // at 2x zoom the world-space corner (200, 100) already lands on screen at (400, 200), and the
    // world-space inset shrinks to INSET / 2 but scales back up by zoom — still the same INSET screen px
    expect(zoomedOut?.x).toBeCloseTo(200 - INSET);
    expect(zoomedIn?.x).toBeCloseTo(400 - INSET);
  });

  it('should apply the inset along the rotated diagonal, not the world-axis diagonal, for a rotated node', () => {
    // a 90° rotation turns the bottom-right corner's inward diagonal into a different one in world
    // space; the button still ends up inset the same distance from the (now-rotated) corner on screen
    const rotated: TSceneNode = { ...rectangle, rotation: 90 };
    const position = getImageCropExpandButtonPosition(
      { mode: 'crop', nodeId: 'rect-1', paintIndex: 0 },
      { 'rect-1': rotated },
      IDENTITY_VIEWPORT,
    );
    const unrotated = getImageCropExpandButtonPosition({ mode: 'crop', nodeId: 'rect-1', paintIndex: 0 }, nodes, IDENTITY_VIEWPORT);

    expect(position).not.toEqual(unrotated);
  });

  it('should account for viewport pan when converting to screen space', () => {
    const position = getImageCropExpandButtonPosition({ mode: 'crop', nodeId: 'rect-1', paintIndex: 0 }, nodes, {
      ...IDENTITY_VIEWPORT,
      x: 50,
      y: 30,
    });

    expect(position?.x).toBeCloseTo(200 - INSET + 50);
    expect(position?.y).toBeCloseTo(100 - INSET + 30);
  });
});
