// types
import { NodeType } from 'types/design/enums';

// utils
import { assembleVectorNodeFromLoopGeometries, TLoopGeometry } from '../assembleVectorNodeFromLoopGeometries';

vi.mock('../getAllLoopFilledFaceKeys', () => ({ getAllLoopFilledFaceKeys: (): string[] => ['k1'] }));

const base = { id: 'vector', name: 'Vector', parentId: 'parent', rotation: 15 };

describe('assembleVectorNodeFromLoopGeometries', () => {
  it('should return nothing without loops', () => {
    // result
    expect(assembleVectorNodeFromLoopGeometries([], base, '#ff0000')).toBeNull();
  });

  it('should merge every loop into one vector filled in the given color', () => {
    // mock
    const loops: TLoopGeometry[] = [
      {
        segments: { s1: { endId: 'b', id: 's1', startId: 'a', tangentEnd: null, tangentStart: null } },
        vertices: { a: { id: 'a', x: 0, y: 0 } },
      },
      { segments: {}, vertices: { b: { id: 'b', x: 1, y: 1 } } },
    ];
    const paint = { color: '#ff0000', opacity: 100, type: 'solid' };

    // before
    const node = assembleVectorNodeFromLoopGeometries(loops, base, '#ff0000');

    // result
    expect(node).toEqual({
      ...base,
      defaultFill: [paint],
      fillByKey: { k1: [paint] },
      filledFaceKeys: ['k1'],
      segments: loops[0].segments,
      strokeWidth: 0,
      strokes: [],
      type: NodeType.vector,
      vertexHandleModes: {},
      vertices: { ...loops[0].vertices, ...loops[1].vertices },
    });
  });
});
