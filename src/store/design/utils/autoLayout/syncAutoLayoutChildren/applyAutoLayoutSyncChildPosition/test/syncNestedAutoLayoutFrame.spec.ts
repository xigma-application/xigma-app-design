// types
import { LayoutMode, NodeType } from 'types/design/enums';
import { TDesignState } from '../../../../../types';
import { TFrameNode, TRectangleNode } from 'types/design/types';

// utils
import { syncNestedAutoLayoutFrame } from '../syncNestedAutoLayoutFrame';

const syncAutoLayoutChildrenMock = vi.fn();

vi.mock('../../syncAutoLayoutChildren', () => ({
  syncAutoLayoutChildren: (...args: unknown[]): unknown => syncAutoLayoutChildrenMock(...args),
}));

const frame = (overrides: Partial<TFrameNode> = {}): TFrameNode => ({
  childIds: [],
  clipContent: true,
  fills: [{ color: '#fff', opacity: 100, type: 'solid' }],
  height: 100,
  id: 'inner',
  name: 'Frame',
  parentId: 'frame-1',
  rotation: 0,
  type: NodeType.frame,
  width: 100,
  x: 0,
  y: 0,
  ...overrides,
});

const rect: TRectangleNode = {
  fills: [{ color: '#fff', opacity: 100, type: 'solid' }],
  height: 20,
  id: 'a',
  name: 'Rectangle',
  parentId: 'frame-1',
  rotation: 0,
  type: NodeType.rectangle,
  width: 20,
  x: 0,
  y: 0,
};

describe('syncNestedAutoLayoutFrame', () => {
  beforeEach(() => {
    syncAutoLayoutChildrenMock.mockReset();
  });

  it('should recurse into a horizontal auto-layout frame child', () => {
    // before
    syncNestedAutoLayoutFrame({} as TDesignState, frame({ layoutMode: LayoutMode.horizontal }));

    // result
    expect(syncAutoLayoutChildrenMock).toHaveBeenCalledWith({}, 'inner');
  });

  it('should recurse into a vertical auto-layout frame child', () => {
    // before
    syncNestedAutoLayoutFrame({} as TDesignState, frame({ layoutMode: LayoutMode.vertical }));

    // result
    expect(syncAutoLayoutChildrenMock).toHaveBeenCalledWith({}, 'inner');
  });

  it('should recurse into a grid auto-layout frame child', () => {
    // before
    syncNestedAutoLayoutFrame({} as TDesignState, frame({ layoutMode: LayoutMode.grid }));

    // result
    expect(syncAutoLayoutChildrenMock).toHaveBeenCalledWith({}, 'inner');
  });

  it('should not recurse into a plain (free-form) frame child', () => {
    // before
    syncNestedAutoLayoutFrame({} as TDesignState, frame({ layoutMode: LayoutMode.freeForm }));

    // result
    expect(syncAutoLayoutChildrenMock).not.toHaveBeenCalled();
  });

  it('should not recurse into a frame child with no layout mode at all', () => {
    // before
    syncNestedAutoLayoutFrame({} as TDesignState, frame({ layoutMode: undefined }));

    // result
    expect(syncAutoLayoutChildrenMock).not.toHaveBeenCalled();
  });

  it('should not recurse into a non-frame child', () => {
    // before
    syncNestedAutoLayoutFrame({} as TDesignState, rect);

    // result
    expect(syncAutoLayoutChildrenMock).not.toHaveBeenCalled();
  });
});
