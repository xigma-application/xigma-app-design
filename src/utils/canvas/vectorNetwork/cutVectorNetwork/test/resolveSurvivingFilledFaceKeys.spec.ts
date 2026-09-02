// types
import { TVectorNetworkComponent } from '../types';

// utils
import { deriveVectorFaces } from '../../deriveVectorFaces/deriveVectorFaces';
import { getVectorFillLoopKey } from '../../getVectorFillLoopKey';
import { resolveSurvivingFilledFaceKeys } from '../resolveSurvivingFilledFaceKeys';

describe('resolveSurvivingFilledFaceKeys', () => {
  it('should keep an original key whose loop still resolves against the (smaller, post-cut) component', () => {
    // mock — a simple closed triangle, unaffected by whatever cut produced this component
    const component: TVectorNetworkComponent = {
      segments: {
        s1: { endId: 'b', id: 's1', startId: 'a', tangentEnd: null, tangentStart: null },
        s2: { endId: 'c', id: 's2', startId: 'b', tangentEnd: null, tangentStart: null },
        s3: { endId: 'a', id: 's3', startId: 'c', tangentEnd: null, tangentStart: null },
      },
      vertexHandleModes: {},
      vertices: { a: { id: 'a', x: 0, y: 0 }, b: { id: 'b', x: 100, y: 0 }, c: { id: 'c', x: 50, y: 100 } },
    };
    const [face] = deriveVectorFaces({
      defaultFill: null,
      filledFaceKeys: [],
      id: 'probe',
      name: '',
      parentId: null,
      rotation: 0,
      segments: component.segments,
      strokeColor: '#000',
      strokeWidth: 1,
      type: 'vector' as never,
      vertexHandleModes: {},
      vertices: component.vertices,
    });
    const key = getVectorFillLoopKey(face.pieceKeys);

    // before
    const survivors = resolveSurvivingFilledFaceKeys([key], component);

    // result
    expect(survivors).toEqual([key]);
  });

  it('should drop an original key whose loop no longer resolves (its segments were severed by the cut)', () => {
    // mock — component has only a single open segment, nothing that could ever form the original closed loop
    const component: TVectorNetworkComponent = {
      segments: { s1: { endId: 'b', id: 's1', startId: 'a', tangentEnd: null, tangentStart: null } },
      vertexHandleModes: {},
      vertices: { a: { id: 'a', x: 0, y: 0 }, b: { id: 'b', x: 100, y: 0 } },
    };
    const staleKey = 's1[v:a|v:b],s2[v:b|v:c],s3[v:a|v:c]';

    // before
    const survivors = resolveSurvivingFilledFaceKeys([staleKey], component);

    // result
    expect(survivors).toEqual([]);
  });

  it('should independently filter multiple original keys, keeping only the ones that still resolve', () => {
    // mock — two independent triangles sharing a hub vertex; component only still has the first one
    const component: TVectorNetworkComponent = {
      segments: {
        e1: { endId: 'p2', id: 'e1', startId: 'p1', tangentEnd: null, tangentStart: null },
        s1: { endId: 'p1', id: 's1', startId: 'h', tangentEnd: null, tangentStart: null },
        s2: { endId: 'p2', id: 's2', startId: 'h', tangentEnd: null, tangentStart: null },
      },
      vertexHandleModes: {},
      vertices: { h: { id: 'h', x: 50, y: 0 }, p1: { id: 'p1', x: 0, y: 100 }, p2: { id: 'p2', x: 100, y: 100 } },
    };
    const [face] = deriveVectorFaces({
      defaultFill: null,
      filledFaceKeys: [],
      id: 'probe',
      name: '',
      parentId: null,
      rotation: 0,
      segments: component.segments,
      strokeColor: '#000',
      strokeWidth: 1,
      type: 'vector' as never,
      vertexHandleModes: {},
      vertices: component.vertices,
    });
    const survivingKey = getVectorFillLoopKey(face.pieceKeys);
    const staleKey = 's3[v:h|v:p3],e2[v:p2|v:p3],s2[v:h|v:p2]';

    // before
    const survivors = resolveSurvivingFilledFaceKeys([survivingKey, staleKey], component);

    // result
    expect(survivors).toEqual([survivingKey]);
  });

  it('should return an empty array when given no original keys', () => {
    // mock
    const component: TVectorNetworkComponent = {
      segments: {},
      vertexHandleModes: {},
      vertices: {},
    };

    // before
    const survivors = resolveSurvivingFilledFaceKeys([], component);

    // result
    expect(survivors).toEqual([]);
  });
});
