// store
import { addNodes } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TResizeDragState } from 'types/design/selectionTool/types';
import { TSectionNode } from 'types/design/types';

// utils
import { commitResizedSectionCapture } from '../commitResizedSectionCapture';
import { createCanvasRefs } from 'components/Design/Canvas/hooks/useCanvasRefs/createCanvasRefs';

const resizeState = (nodeOrigins: TResizeDragState['nodeOrigins']): TResizeDragState => ({ nodeOrigins }) as TResizeDragState;

describe('commitResizedSectionCapture', () => {
  it('should collect the siblings a single resized section now fits and clear the outlines', () => {
    // mock
    const canvasRefs = createCanvasRefs();
    canvasRefs.transform.sectionCaptureIdsRef.current = ['resizedChild'];
    store.dispatch(
      addNodes({
        nodes: [
          {
            fills: [],
            height: 50,
            id: 'resizedChild',
            name: 'r',
            parentId: null,
            rotation: 0,
            type: NodeType.rectangle,
            width: 50,
            x: 10,
            y: 10,
          },
          {
            childIds: [],
            fills: [{ color: '#444444', opacity: 100, type: 'solid' }],
            height: 200,
            id: 'resizedSection',
            name: 's',
            parentId: null,
            rotation: 0,
            type: NodeType.section,
            width: 200,
            x: 0,
            y: 0,
          },
        ],
        rootIds: ['resizedChild', 'resizedSection'],
      }),
    );

    // action
    commitResizedSectionCapture(
      store.dispatch,
      resizeState({ resizedSection: { flip: null, height: 20, rotation: 0, width: 20, x: 0, y: 0 } }),
      canvasRefs,
    );

    // result
    expect((selectActivePage(store.getState()).nodes.resizedSection as TSectionNode).childIds).toEqual(['resizedChild']);
    expect(canvasRefs.transform.sectionCaptureIdsRef.current).toEqual([]);
  });

  it('should leave a resize of several layers or of a line alone', () => {
    // mock
    const canvasRefs = createCanvasRefs();
    canvasRefs.transform.sectionCaptureIdsRef.current = ['stale'];

    // action
    commitResizedSectionCapture(store.dispatch, resizeState({ line: { x1: 0, x2: 10, y1: 0, y2: 10 } }), canvasRefs);

    // result
    expect(canvasRefs.transform.sectionCaptureIdsRef.current).toEqual([]);
  });
});
