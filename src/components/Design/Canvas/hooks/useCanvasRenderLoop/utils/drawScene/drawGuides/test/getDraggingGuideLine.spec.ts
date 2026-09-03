// types
import { NodeType } from 'types/design/enums';
import { TGuideDragState } from 'types/design/canvas/types';
import { TSceneNode } from 'types/design/types';

// utils
import { getDraggingGuideLine } from '../getDraggingGuideLine';

const frame: TSceneNode = {
  fill: '#ff0000',
  height: 100,
  id: 'frame',
  name: 'frame',
  parentId: null,
  rotation: 0,
  childIds: [], clipContent: true, type: NodeType.frame,
  width: 200,
  x: 10,
  y: 20,
};

describe('getDraggingGuideLine', () => {
  it('should turn a page (frameId null) drag into a viewport-spanning line with an empty id when uncommitted', () => {
    // mock
    const dragging: TGuideDragState = { axis: 'x', frameId: null, hasMoved: false, id: null, position: 75 };

    // result
    expect(getDraggingGuideLine(dragging, {})).toEqual({ axis: 'x', frameId: null, id: '', span: null, worldPosition: 75 });
  });

  it('should keep the real id when dragging an already-committed page guide', () => {
    // mock
    const dragging: TGuideDragState = { axis: 'x', frameId: null, hasMoved: true, id: 'guide-1', position: 90 };

    // result
    expect(getDraggingGuideLine(dragging, {})).toEqual({ axis: 'x', frameId: null, id: 'guide-1', span: null, worldPosition: 90 });
  });

  it('should clip a frame-drag to that frame’s span, looked up by id', () => {
    // mock
    const dragging: TGuideDragState = { axis: 'y', frameId: 'frame', hasMoved: false, id: 'guide-1', position: 60 };

    // result
    expect(getDraggingGuideLine(dragging, { frame })).toEqual({
      axis: 'y',
      frameId: 'frame',
      id: 'guide-1',
      span: { from: 10, to: 210 },
      worldPosition: 60,
    });
  });

  it('should use an empty id for an uncommitted frame-drag too', () => {
    // mock
    const dragging: TGuideDragState = { axis: 'y', frameId: 'frame', hasMoved: false, id: null, position: 60 };

    // result
    expect(getDraggingGuideLine(dragging, { frame })).toEqual({
      axis: 'y',
      frameId: 'frame',
      id: '',
      span: { from: 10, to: 210 },
      worldPosition: 60,
    });
  });

  it('should fall back to an unclipped span when the named frame no longer exists', () => {
    // mock
    const dragging: TGuideDragState = { axis: 'y', frameId: 'missing', hasMoved: false, id: 'guide-1', position: 60 };

    // result
    expect(getDraggingGuideLine(dragging, {})).toEqual({ axis: 'y', frameId: 'missing', id: 'guide-1', span: null, worldPosition: 60 });
  });
});
