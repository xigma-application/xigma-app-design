// store
import { beginHistoryGesture, endHistoryGesture } from 'store/history/actions';
import { updateNode } from 'store/design/slice';

// types
import { NodeType } from 'types/design/enums';
import { TFrameNode, TRectangleNode, TSceneNode } from 'types/design/types';
import { TSelectionColorOccurrence } from '../../types';

// utils
import { commitSelectionColorChange } from '../commitSelectionColorChange';

const child: TRectangleNode = {
  fills: [{ color: '#ff0000', opacity: 100, type: 'solid' }],
  height: 10,
  id: 'child',
  name: 'Rectangle',
  parentId: 'frame',
  rotation: 0,
  type: NodeType.rectangle,
  width: 10,
  x: 0,
  y: 0,
};

const frame: TFrameNode = {
  childIds: ['child'],
  clipContent: true,
  fills: [{ color: '#ff0000', opacity: 100, type: 'solid' }],
  height: 100,
  id: 'frame',
  name: 'Frame',
  parentId: null,
  rotation: 0,
  type: NodeType.frame,
  width: 100,
  x: 0,
  y: 0,
};

const nodesById: Record<string, TSceneNode> = { child, frame };
const nextPaint = { color: '#00ff00', opacity: 100, type: 'solid' } as const;

describe('commitSelectionColorChange', () => {
  it('should dispatch a single updateNode without a history gesture for a solo occurrence', () => {
    // mock
    const dispatch = vi.fn();
    const occurrences: TSelectionColorOccurrence[] = [{ index: 0, nodeId: 'frame', property: 'fills' }];

    // action
    commitSelectionColorChange(dispatch, nodesById, occurrences, nextPaint);

    // result
    expect(dispatch).toHaveBeenCalledTimes(1);
    expect(dispatch).toHaveBeenCalledWith(updateNode({ changes: { fills: [{ ...nextPaint, visible: undefined }] }, id: 'frame' }));
  });

  it('should wrap every affected node’s updateNode in one history gesture', () => {
    // mock
    const dispatch = vi.fn();
    const occurrences: TSelectionColorOccurrence[] = [
      { index: 0, nodeId: 'frame', property: 'fills' },
      { index: 0, nodeId: 'child', property: 'fills' },
    ];

    // action
    commitSelectionColorChange(dispatch, nodesById, occurrences, nextPaint);

    // result
    expect(dispatch).toHaveBeenCalledWith(beginHistoryGesture(expect.anything()));
    expect(dispatch).toHaveBeenCalledWith(updateNode({ changes: { fills: [{ ...nextPaint, visible: undefined }] }, id: 'frame' }));
    expect(dispatch).toHaveBeenCalledWith(updateNode({ changes: { fills: [{ ...nextPaint, visible: undefined }] }, id: 'child' }));
    expect(dispatch).toHaveBeenCalledWith(endHistoryGesture());
  });
});
