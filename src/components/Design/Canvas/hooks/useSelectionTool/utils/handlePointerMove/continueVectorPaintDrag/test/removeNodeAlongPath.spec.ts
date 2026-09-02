// types
import { NodeType } from 'types/design/enums';
import { TVectorNode } from 'types/design/types';

// utils
import { removeNodeAlongPath } from '../removeNodeAlongPath';

const buildNode = (filledFaceKeys: string[]): TVectorNode => ({
  defaultFill: null,
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

describe('removeNodeAlongPath behaviors', () => {
  it('should do nothing when none of the loop keys on the path are currently filled', () => {
    // mock
    const dispatch = vi.fn();
    const node = buildNode(['other']);

    // before
    removeNodeAlongPath(dispatch, node, ['face-a'], false, {}, {});

    // result
    expect(dispatch).not.toHaveBeenCalled();
  });

  it('should drop only the filled loop keys the path crosses, leaving other filled faces untouched', () => {
    // mock
    const dispatch = vi.fn();
    const node = buildNode(['face-a', 'face-b']);

    // before
    removeNodeAlongPath(dispatch, node, ['face-a'], false, {}, {});

    // result
    expect(dispatch).toHaveBeenCalledTimes(1);

    const changes = dispatch.mock.calls[0][0].payload.changes as Partial<TVectorNode>;

    expect(dispatch.mock.calls[0][0].payload.id).toBe('node-1');
    expect(changes).toEqual({ filledFaceKeys: ['face-b'] });
  });

  it('should include the baked segments/vertices in the dispatched changes when the geometry changed', () => {
    // mock
    const dispatch = vi.fn();
    const node = buildNode(['face-a']);
    const segments = { s1: { endId: 'b', id: 's1', startId: 'a', tangentEnd: null, tangentStart: null } };
    const vertices = { a: { id: 'a', x: 0, y: 0 }, b: { id: 'b', x: 1, y: 1 } };

    // before
    removeNodeAlongPath(dispatch, node, ['face-a'], true, segments, vertices);

    // result
    const changes = dispatch.mock.calls[0][0].payload.changes as Partial<TVectorNode>;

    expect(changes).toEqual({ filledFaceKeys: [], segments, vertices });
  });
});
