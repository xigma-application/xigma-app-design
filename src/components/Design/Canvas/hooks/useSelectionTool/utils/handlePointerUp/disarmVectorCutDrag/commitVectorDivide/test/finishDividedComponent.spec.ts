// types
import { NodeType } from 'types/design/enums';
import { TVectorNode } from 'types/design/types';

// utils
import { deriveVectorFaces } from 'utils/canvas/vectorNetwork/deriveVectorFaces/deriveVectorFaces';
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

// same filled square, plus a pendant tail (d→e) sticking out — a divide line crossing only the tail
// disconnects a bare stub from the still-fully-closed, untouched square
const buildSquareWithTailNode = (color: string): TVectorNode => {
  const segments = {
    s1: { endId: 'b', id: 's1', startId: 'a', tangentEnd: null, tangentStart: null },
    s2: { endId: 'c', id: 's2', startId: 'b', tangentEnd: null, tangentStart: null },
    s3: { endId: 'd', id: 's3', startId: 'c', tangentEnd: null, tangentStart: null },
    s4: { endId: 'a', id: 's4', startId: 'd', tangentEnd: null, tangentStart: null },
    tail: { endId: 'e', id: 'tail', startId: 'd', tangentEnd: null, tangentStart: null },
  } as const;
  const vertices = {
    a: { id: 'a', x: 0, y: 0 },
    b: { id: 'b', x: 100, y: 0 },
    c: { id: 'c', x: 100, y: 100 },
    d: { id: 'd', x: 0, y: 100 },
    e: { id: 'e', x: -100, y: 100 },
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
  const [face] = deriveVectorFaces(node);
  const key = getVectorFillLoopKey(face.pieceKeys);

  return { ...node, fillColorOverrideByKey: { [key]: color }, filledFaceKeys: [key] };
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

  it('should copy the original face’s own picked color onto BOTH new pieces of a clean chord split, Figma-style (§53)', () => {
    // mock — the square's own single face has an explicit paint-tool color; the divide line crosses
    // the left and right edges, cleanly splitting the one face into a top half and a bottom half —
    // both are a real, clean chord split of the same original face, so both should inherit its color
    const node = buildSquareNode(true);
    const [originalKey] = node.filledFaceKeys;
    const paintedNode = { ...node, fillColorOverrideByKey: { [originalKey]: '#ff0000' } };
    const divideResult = findVectorDivideResult(paintedNode, { x: -20, y: 50 }, { x: 120, y: 50 })!;

    // before
    const finishedHalves = divideResult.components.map((component) =>
      finishDividedComponent(paintedNode, divideResult.vertexLineT, divideResult.crossings, component),
    );

    // result — every resulting half is filled with the original picked color, not a hash-derived one
    finishedHalves.forEach((finished) => {
      expect(finished.filledFaceKeys!.length).toBeGreaterThan(0);
      expect(finished.fillColorOverrideByKey![finished.filledFaceKeys![0]]).toBe('#ff0000');
    });
  });

  it('should keep the untouched, still-closed square’s own picked color when only an unrelated pendant tail is divided off', () => {
    // mock — the divide line crosses only the tail, never the square itself
    const node = buildSquareWithTailNode('#00ff00');
    const [originalKey] = node.filledFaceKeys;
    const divideResult = findVectorDivideResult(node, { x: -50, y: 50 }, { x: -50, y: 150 })!;
    const squareComponent = divideResult.components.find((component) => 'a' in component.vertices)!;

    // before
    const finished = finishDividedComponent(node, divideResult.vertexLineT, divideResult.crossings, squareComponent);

    // result — the square's own loop survives geometrically untouched, so it keeps its picked color
    expect(finished.filledFaceKeys).toEqual([originalKey]);
    expect(finished.fillColorOverrideByKey![originalKey]).toBe('#00ff00');
  });
});
