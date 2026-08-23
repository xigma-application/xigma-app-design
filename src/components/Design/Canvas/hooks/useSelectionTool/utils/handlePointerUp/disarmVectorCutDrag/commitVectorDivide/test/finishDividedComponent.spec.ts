// types
import { NodeType } from 'types/design/enums';
import { TVectorNode } from 'types/design/types';

// utils
import { deriveVectorFaces } from 'utils/canvas/vectorNetwork/deriveVectorFaces';
import { findVectorDivideResult } from '../findVectorDivideResult';
import { finishDividedComponent } from '../finishDividedComponent';
import { getVectorFillLoopKey } from 'utils/canvas/vectorNetwork/getVectorFillLoopKey';

const buildSquareNode = (filled: boolean): TVectorNode => {
  const segments = {
    s1: { endId: 'b', id: 's1', startId: 'a', tangentEnd: null, tangentStart: null },
    s2: { endId: 'c', id: 's2', startId: 'b', tangentEnd: null, tangentStart: null },
    s3: { endId: 'd', id: 's3', startId: 'c', tangentEnd: null, tangentStart: null },
    s4: { endId: 'a', id: 's4', startId: 'd', tangentEnd: null, tangentStart: null },
  } as const;
  const vertices = {
    a: { id: 'a', x: 0, y: 0 },
    b: { id: 'b', x: 100, y: 0 },
    c: { id: 'c', x: 100, y: 100 },
    d: { id: 'd', x: 0, y: 100 },
  };
  const node: TVectorNode = {
    fillColor: '#ff0000',
    filledFaceKeys: [],
    id: 'square',
    name: 'Vector',
    parentId: null,
    rotation: 0,
    segments,
    strokeColor: '#000000',
    strokeWidth: 1,
    type: NodeType.vector,
    vertexHandleModes: {},
    vertices,
  };

  if (filled) {
    const [face] = deriveVectorFaces(node);

    return { ...node, filledFaceKeys: [getVectorFillLoopKey(face.pieceKeys)] };
  }

  return node;
};

describe('finishDividedComponent', () => {
  it('should leave the component filledFaceKeys empty when the original node has no fill', () => {
    // mock
    const node = buildSquareNode(false);
    const divideResult = findVectorDivideResult(node, { x: -20, y: 50 }, { x: 120, y: 50 })!;

    // before
    const finished = finishDividedComponent(node, divideResult.vertexLineT, divideResult.crossings, divideResult.components[0]);

    // result
    expect(finished.filledFaceKeys).toEqual([]);
  });

  it('should close the cut and inherit fill for a divided half of an already-filled square', () => {
    // mock
    const node = buildSquareNode(true);
    const divideResult = findVectorDivideResult(node, { x: -20, y: 50 }, { x: 120, y: 50 })!;
    const openComponent = divideResult.components[0];

    // before
    const finished = finishDividedComponent(node, divideResult.vertexLineT, divideResult.crossings, openComponent);

    // result — a closing segment was spliced into the open half, and the new fill key inherits from
    // the original square's one fill
    expect(Object.keys(finished.segments).length).toBeGreaterThan(Object.keys(openComponent.segments).length);
    expect(finished.filledFaceKeys!.length).toBeGreaterThan(0);
  });
});
