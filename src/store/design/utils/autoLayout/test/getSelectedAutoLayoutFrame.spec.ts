// types
import { LayoutMode, NodeType } from 'types/design/enums';
import { TFrameNode, TRectangleNode } from 'types/design/types';

// utils
import { getSelectedAutoLayoutFrame } from '../getSelectedAutoLayoutFrame';

const frame: TFrameNode = {
  childIds: [],
  clipContent: true,
  fill: '#fff',
  height: 200,
  id: 'frame-1',
  layoutMode: LayoutMode.horizontal,
  name: 'Frame',
  parentId: null,
  rotation: 0,
  type: NodeType.frame,
  width: 300,
  x: 0,
  y: 0,
};

const rectangle: TRectangleNode = {
  fill: '#000',
  height: 50,
  id: 'rect-1',
  name: 'Rectangle',
  parentId: null,
  rotation: 0,
  type: NodeType.rectangle,
  width: 50,
  x: 0,
  y: 0,
};

describe('getSelectedAutoLayoutFrame', () => {
  it('should return the frame when it is the sole selected node, in horizontal layout mode', () => {
    // result
    expect(getSelectedAutoLayoutFrame([frame])).toBe(frame);
  });

  it('should return the frame when it is the sole selected node, in vertical layout mode', () => {
    // mock
    const verticalFrame = { ...frame, layoutMode: LayoutMode.vertical };

    // result
    expect(getSelectedAutoLayoutFrame([verticalFrame])).toBe(verticalFrame);
  });

  it('should return null when nothing is selected', () => {
    // result
    expect(getSelectedAutoLayoutFrame([])).toBeNull();
  });

  it('should return null when more than one node is selected', () => {
    // result
    expect(getSelectedAutoLayoutFrame([frame, rectangle])).toBeNull();
  });

  it('should return null when the selected node is not a frame', () => {
    // result
    expect(getSelectedAutoLayoutFrame([rectangle])).toBeNull();
  });

  it('should return null when the selected frame is not in an auto-layout mode', () => {
    // mock
    const freeFormFrame = { ...frame, layoutMode: LayoutMode.freeForm };

    // result
    expect(getSelectedAutoLayoutFrame([freeFormFrame])).toBeNull();
  });
});
