// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TSceneNode } from 'types/design/types';

// utils
import { captureDraggedVectorNodeSnapshots } from '../captureDraggedVectorNodeSnapshots';

vi.mock('../../../isSnapshotVectorNode', () => ({ isSnapshotVectorNode: (node: { id: string }): boolean => node.id.startsWith('vec') }));
vi.mock('utils/canvas/drawVectorNode/captureVectorNodeDragSnapshot', () => ({
  captureVectorNodeDragSnapshot: (node: { id: string }): string => `snapshot-${node.id}`,
}));

const nodes = { rect: { id: 'rect' }, vecA: { id: 'vecA' }, vecB: { id: 'vecB' } } as unknown as Record<string, TSceneNode>;
const refs = (): TCanvasRefs => ({ vectorSnapshots: { draggedVectorNodeSnapshotsRef: { current: null } } }) as unknown as TCanvasRefs;

describe('captureDraggedVectorNodeSnapshots', () => {
  it('should snapshot every dragged vector for a fast drag preview', () => {
    // mock
    const canvasRefs = refs();

    // before
    captureDraggedVectorNodeSnapshots(['vecA', 'rect', 'vecB'], nodes, canvasRefs);

    // result
    expect(canvasRefs.vectorSnapshots.draggedVectorNodeSnapshotsRef.current).toEqual(
      new Map([
        ['vecA', 'snapshot-vecA'],
        ['vecB', 'snapshot-vecB'],
      ]),
    );
  });

  it('should leave the snapshots alone when no vector is dragged', () => {
    // mock
    const canvasRefs = refs();

    // before
    captureDraggedVectorNodeSnapshots(['rect'], nodes, canvasRefs);

    // result
    expect(canvasRefs.vectorSnapshots.draggedVectorNodeSnapshotsRef.current).toBeNull();
  });
});
