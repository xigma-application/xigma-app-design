// types
import { NodeType } from 'types/design/enums';
import { TPaint } from 'types/design/paint/types';
import { TVectorNode } from 'types/design/types';

// utils
import { addNodeAlongPath } from '../addNodeAlongPath';

const solid = (color: string): TPaint[] => [{ color, opacity: 100, type: 'solid' }];

const buildNode = (filledFaceKeys: string[], fillByKey: Record<string, TPaint[]> = {}): TVectorNode => ({
  defaultFill: null,
  fillByKey,
  filledFaceKeys,
  id: 'node-1',
  name: 'Vector',
  parentId: null,
  rotation: 0,
  segments: {},
  strokeColor: '#000000',
  strokeWidth: 1,
  type: NodeType.vector,
  vertexHandleModes: {},
  vertices: {},
});

describe('addNodeAlongPath behaviors', () => {
  it('should do nothing when no face lies on the path', () => {
    // mock
    const dispatch = vi.fn();
    const node = buildNode([]);

    // before
    addNodeAlongPath(dispatch, node, [], '#00ff00', false, {}, {});

    // result
    expect(dispatch).not.toHaveBeenCalled();
  });

  it('should append a newly-crossed face and set its color, without duplicating an already-filled entry', () => {
    // mock
    const dispatch = vi.fn();
    const node = buildNode(['face-a'], { 'face-a': solid('#ff0000') });

    // before
    addNodeAlongPath(dispatch, node, ['face-a', 'face-b'], '#00ff00', false, {}, {});

    // result
    const changes = dispatch.mock.calls[0][0].payload.changes as Partial<TVectorNode>;

    expect(dispatch.mock.calls[0][0].payload.id).toBe('node-1');
    expect(changes.filledFaceKeys).toEqual(['face-a', 'face-b']);
    expect(changes.fillByKey).toEqual({ 'face-a': solid('#00ff00'), 'face-b': solid('#00ff00') });
  });

  it('should include the baked segments/vertices in the dispatched changes when the geometry changed', () => {
    // mock
    const dispatch = vi.fn();
    const node = buildNode([]);
    const segments = { s1: { endId: 'b', id: 's1', startId: 'a', tangentEnd: null, tangentStart: null } };
    const vertices = { a: { id: 'a', x: 0, y: 0 }, b: { id: 'b', x: 1, y: 1 } };

    // before
    addNodeAlongPath(dispatch, node, ['face-a'], '#00ff00', true, segments, vertices);

    // result
    const changes = dispatch.mock.calls[0][0].payload.changes as Partial<TVectorNode>;

    expect(changes).toEqual({
      fillByKey: { 'face-a': solid('#00ff00') },
      filledFaceKeys: ['face-a'],
      segments,
      vertices,
    });
  });
});
