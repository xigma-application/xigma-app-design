// store
import { addNodes } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TRectangleNode, TSectionNode } from 'types/design/types';

// utils
import { createCanvasRefs } from 'components/Design/Canvas/hooks/useCanvasRefs/createCanvasRefs';
import { updateSectionCaptureIds } from '../updateSectionCaptureIds';

const makeRectangle = (id: string, x: number, y: number, parentId: string | null = null): TRectangleNode => ({
  fills: [],
  height: 50,
  id,
  name: id,
  parentId,
  rotation: 0,
  type: NodeType.rectangle,
  width: 50,
  x,
  y,
});

const makeSection = (
  id: string,
  box: { height: number; width: number; x: number; y: number },
  childIds: string[] = [],
  parentId: string | null = null,
): TSectionNode => ({
  ...box,
  childIds,
  fill: '#444444',
  id,
  name: id,
  parentId,
  rotation: 0,
  type: NodeType.section,
});

describe('updateSectionCaptureIds', () => {
  it('should store the siblings a section would collect, without moving them', () => {
    // mock
    const canvasRefs = createCanvasRefs();
    store.dispatch(
      addNodes({
        nodes: [makeRectangle('liveA', 10, 10), makeSection('liveSection', { height: 200, width: 200, x: 0, y: 0 })],
        rootIds: ['liveA', 'liveSection'],
      }),
    );

    // action
    updateSectionCaptureIds(canvasRefs, 'liveSection');

    // result
    expect(canvasRefs.transform.sectionCaptureIdsRef.current).toEqual(['liveA']);
    expect(selectActivePage(store.getState()).nodes.liveA.parentId).toBeNull();
  });

  it('should store nothing for a node that is not a section', () => {
    // mock
    const canvasRefs = createCanvasRefs();
    canvasRefs.transform.sectionCaptureIdsRef.current = ['stale'];

    // action
    updateSectionCaptureIds(canvasRefs, 'liveA');

    // result
    expect(canvasRefs.transform.sectionCaptureIdsRef.current).toEqual([]);
  });
});
