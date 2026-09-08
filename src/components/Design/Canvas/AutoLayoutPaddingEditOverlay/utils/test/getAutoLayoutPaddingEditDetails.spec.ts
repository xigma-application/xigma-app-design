// types
import { LayoutMode, NodeType } from 'types/design/enums';
import { TAutoLayoutPaddingEditState } from 'utils/canvas/autoLayoutPadding/types';
import { TFrameNode, TRectangleNode } from 'types/design/types';

// utils
import { getAutoLayoutPaddingEditDetails } from '../getAutoLayoutPaddingEditDetails';

const viewport = { x: 10, y: 20, zoom: 2 };

const frame: TFrameNode = {
  childIds: [],
  clipContent: true,
  fill: '#fff',
  height: 200,
  id: 'frame-1',
  layoutMode: LayoutMode.horizontal,
  name: 'Frame',
  paddingTop: 12,
  parentId: null,
  rotation: 0,
  type: NodeType.frame,
  width: 300,
  x: 0,
  y: 0,
};

describe('getAutoLayoutPaddingEditDetails', () => {
  it('should return null when there is no edit state', () => {
    expect(getAutoLayoutPaddingEditDetails(null, { 'frame-1': frame }, viewport)).toBeNull();
  });

  it('should return null when the referenced frame no longer exists', () => {
    const editState: TAutoLayoutPaddingEditState = { frameId: 'missing', point: { x: 0, y: 0 }, side: 'top' };

    expect(getAutoLayoutPaddingEditDetails(editState, { 'frame-1': frame }, viewport)).toBeNull();
  });

  it('should return null when the referenced node is not a frame', () => {
    const rectangle: TRectangleNode = {
      fill: '#000',
      height: 50,
      id: 'frame-1',
      name: 'Rectangle',
      parentId: null,
      rotation: 0,
      type: NodeType.rectangle,
      width: 50,
      x: 0,
      y: 0,
    };
    const editState: TAutoLayoutPaddingEditState = { frameId: 'frame-1', point: { x: 0, y: 0 }, side: 'top' };

    expect(getAutoLayoutPaddingEditDetails(editState, { 'frame-1': rectangle }, viewport)).toBeNull();
  });

  it('should project the world point to screen space and resolve the side’s icon and value', () => {
    const editState: TAutoLayoutPaddingEditState = { frameId: 'frame-1', point: { x: 100, y: 50 }, side: 'top' };

    expect(getAutoLayoutPaddingEditDetails(editState, { 'frame-1': frame }, viewport)).toEqual({
      centerX: 210,
      centerY: 120,
      frameId: 'frame-1',
      iconName: 'PaddingT',
      initialValue: 12,
      side: 'top',
    });
  });

  it('should default an unset padding value to 0', () => {
    const editState: TAutoLayoutPaddingEditState = { frameId: 'frame-1', point: { x: 0, y: 0 }, side: 'left' };

    expect(getAutoLayoutPaddingEditDetails(editState, { 'frame-1': frame }, viewport)).toMatchObject({ initialValue: 0 });
  });
});
