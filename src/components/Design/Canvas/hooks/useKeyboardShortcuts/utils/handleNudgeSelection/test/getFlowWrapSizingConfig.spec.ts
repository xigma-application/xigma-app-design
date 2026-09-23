// store
import { addNodes, deleteNode } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { LayoutMode, NodeType } from 'types/design/enums';
import { TFrameNode } from 'types/design/types';

// utils
import { getFlowWrapSizingConfig } from '../getFlowWrapSizingConfig';

let seq = 0;

const setupFrame = (layoutMode: LayoutMode.horizontal | LayoutMode.vertical, width: number, height: number): { frameId: string } => {
  seq += 1;

  const frameId = `flow-sizing-frame-${seq}`;

  store.dispatch(
    addNodes({
      nodes: [
        {
          childIds: [],
          clipContent: true,
          fill: '#fff',
          height,
          id: frameId,
          layoutMode,
          name: 'Frame',
          parentId: null,
          rotation: 0,
          type: NodeType.frame,
          width,
          x: 0,
          y: 0,
        },
      ] as any,
      rootIds: [frameId],
    }),
  );

  return { frameId };
};

describe('getFlowWrapSizingConfig', () => {
  beforeEach(() => {
    selectActivePage(store.getState()).rootOrder.forEach((id) => store.dispatch(deleteNode(id)));
  });

  it('should read the width as the available primary space for a horizontal frame', () => {
    const { frameId } = setupFrame(LayoutMode.horizontal, 300, 150);
    const frame = selectActivePage(store.getState()).nodes[frameId] as TFrameNode;

    expect(getFlowWrapSizingConfig(frame)).toMatchObject({ availablePrimary: 300, isHorizontal: true, itemSpacing: 0 });
  });

  it('should read the height as the available primary space for a vertical frame', () => {
    const { frameId } = setupFrame(LayoutMode.vertical, 300, 150);
    const frame = selectActivePage(store.getState()).nodes[frameId] as TFrameNode;

    expect(getFlowWrapSizingConfig(frame)).toMatchObject({ availablePrimary: 150, isHorizontal: false, itemSpacing: 0 });
  });
});
