// store
import { addNodes } from 'store/design/slice';
import { selectActivePage, selectRenderOrderedNodes } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TCanvasRefs } from 'types/design/canvas/types';
import { TSectionNode } from 'types/design/types';

// utils
import { createCanvasRefs } from 'components/Design/Canvas/hooks/useCanvasRefs/createCanvasRefs';
import { resolveSectionDragReparentTarget } from '../resolveSectionDragReparentTarget';

const makeSection = (id: string, x: number, size: number): TSectionNode => ({
  childIds: [],
  fill: '#444444',
  height: size,
  id,
  name: id,
  parentId: null,
  rotation: 0,
  type: NodeType.section,
  width: size,
  x,
  y: 0,
});

const resolve = (canvasRefs: TCanvasRefs, id: string, point: { x: number; y: number }): void => {
  const state = store.getState();
  const { nodes } = selectActivePage(state);

  resolveSectionDragReparentTarget(store.dispatch, state, [nodes[id]], point, selectRenderOrderedNodes(state), nodes, canvasRefs);
};

describe('resolveSectionDragReparentTarget', () => {
  it('should highlight the section under the pointer and move the dragged section into it', () => {
    // mock
    const canvasRefs = createCanvasRefs();
    store.dispatch(addNodes({ nodes: [makeSection('dropHost', 0, 400), makeSection('dragged', 1000, 50)], rootIds: ['dropHost', 'dragged'] }));

    // action
    resolve(canvasRefs, 'dragged', { x: 100, y: 100 });

    // result
    expect(canvasRefs.transform.dropTargetFrameIdRef.current).toBe('dropHost');
    expect(selectActivePage(store.getState()).nodes.dragged.parentId).toBe('dropHost');
  });

  it('should leave the section where it is when it already sits in the target', () => {
    // mock
    const canvasRefs = createCanvasRefs();
    store.dispatch(addNodes({ nodes: [makeSection('lonely', 5000, 50)], rootIds: ['lonely'] }));
    const spy = vi.spyOn(store, 'dispatch');

    // action
    resolve(canvasRefs, 'lonely', { x: 9000, y: 9000 });

    // result
    expect(canvasRefs.transform.dropTargetFrameIdRef.current).toBeNull();
    expect(spy).not.toHaveBeenCalled();

    spy.mockRestore();
  });
});
