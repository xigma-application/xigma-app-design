// store
import { addNode, setSelection, setVectorEditingNodeIds } from 'store/design/slice';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';

// utils
import { createCanvasRefs } from '../../../../useCanvasRefs/createCanvasRefs';
import { resolveVectorCutMarkConsumption } from '../resolveVectorCutMarkConsumption';

const addVectorNode = (vertices: Record<string, { id: string; x: number; y: number }>): string => {
  store.dispatch(
    addNode({
      fillColor: null,
      filledFaceKeys: [],
      name: 'Vector',
      parentId: null,
      rotation: 0,
      segments: {},
      strokeColor: '#000000',
      strokeWidth: 1,
      type: NodeType.vector,
      vertexHandleModes: {},
      vertices,
    }),
  );

  const { rootOrder } = store.getState().design;

  return rootOrder[rootOrder.length - 1];
};

describe('resolveVectorCutMarkConsumption', () => {
  afterEach(() => {
    store.dispatch(setSelection([]));
    store.dispatch(setVectorEditingNodeIds([]));
  });

  it('should leave an untouched pink mark alone while it has never been selected', () => {
    // mock
    const nodeId = addVectorNode({ v1: { id: 'v1', x: 0, y: 0 } });

    store.dispatch(setVectorEditingNodeIds([nodeId]));

    const canvasRefs = createCanvasRefs();

    canvasRefs.newVectorCutVertexIdsRef.current = new Set(['v1']);
    canvasRefs.selectedVectorVertexIdsRef.current = [];

    // before
    resolveVectorCutMarkConsumption(canvasRefs);

    // result
    expect(canvasRefs.newVectorCutVertexIdsRef.current).toEqual(new Set(['v1']));
    expect(canvasRefs.touchedVectorCutVertexIdsRef.current).toEqual(new Set());
  });

  it('should record a pink vertex as touched once it becomes selected, without unmarking it yet', () => {
    // mock
    const nodeId = addVectorNode({ v1: { id: 'v1', x: 0, y: 0 } });

    store.dispatch(setVectorEditingNodeIds([nodeId]));

    const canvasRefs = createCanvasRefs();

    canvasRefs.newVectorCutVertexIdsRef.current = new Set(['v1']);
    canvasRefs.selectedVectorVertexIdsRef.current = ['v1'];

    // before
    resolveVectorCutMarkConsumption(canvasRefs);

    // result — still pink while selected, just now flagged as touched
    expect(canvasRefs.newVectorCutVertexIdsRef.current).toEqual(new Set(['v1']));
    expect(canvasRefs.touchedVectorCutVertexIdsRef.current).toEqual(new Set(['v1']));
  });

  it('should un-mark a pink vertex once it is deselected after having been touched (select-then-deselect)', () => {
    // mock — simulate the two frames: selected, then deselected
    const nodeId = addVectorNode({ v1: { id: 'v1', x: 0, y: 0 } });

    store.dispatch(setVectorEditingNodeIds([nodeId]));

    const canvasRefs = createCanvasRefs();

    canvasRefs.newVectorCutVertexIdsRef.current = new Set(['v1']);
    canvasRefs.selectedVectorVertexIdsRef.current = ['v1'];
    resolveVectorCutMarkConsumption(canvasRefs);

    canvasRefs.selectedVectorVertexIdsRef.current = [];

    // before
    resolveVectorCutMarkConsumption(canvasRefs);

    // result
    expect(canvasRefs.newVectorCutVertexIdsRef.current).toEqual(new Set());
    expect(canvasRefs.touchedVectorCutVertexIdsRef.current).toEqual(new Set());
  });

  it('should also un-mark a coincident sibling at the exact same point — a Split severs into two disconnected ids at one spot, and the user can only ever click one of them', () => {
    // mock — v1 and v2 are two distinct vertex ids sitting at the exact same coordinate (a severed pair)
    const nodeId = addVectorNode({ v1: { id: 'v1', x: 50, y: 0 }, v2: { id: 'v2', x: 50, y: 0 } });

    store.dispatch(setVectorEditingNodeIds([nodeId]));

    const canvasRefs = createCanvasRefs();

    canvasRefs.newVectorCutVertexIdsRef.current = new Set(['v1', 'v2']);
    canvasRefs.selectedVectorVertexIdsRef.current = ['v1'];
    resolveVectorCutMarkConsumption(canvasRefs);

    canvasRefs.selectedVectorVertexIdsRef.current = [];

    // before — only v1 was ever actually selected; v2 (its coincident twin) was never touched directly
    resolveVectorCutMarkConsumption(canvasRefs);

    // result — both are consumed together
    expect(canvasRefs.newVectorCutVertexIdsRef.current).toEqual(new Set());
    expect(canvasRefs.touchedVectorCutVertexIdsRef.current).toEqual(new Set());
  });

  it('should not un-mark an unrelated pink vertex that merely sits elsewhere', () => {
    // mock — v1/v2 are a coincident severed pair at (50,0); v3 is an unrelated pink vertex from a
    // different cut, elsewhere on the same node
    const nodeId = addVectorNode({
      v1: { id: 'v1', x: 50, y: 0 },
      v2: { id: 'v2', x: 50, y: 0 },
      v3: { id: 'v3', x: 999, y: 999 },
    });

    store.dispatch(setVectorEditingNodeIds([nodeId]));

    const canvasRefs = createCanvasRefs();

    canvasRefs.newVectorCutVertexIdsRef.current = new Set(['v1', 'v2', 'v3']);
    canvasRefs.selectedVectorVertexIdsRef.current = ['v1'];
    resolveVectorCutMarkConsumption(canvasRefs);

    canvasRefs.selectedVectorVertexIdsRef.current = [];

    // before
    resolveVectorCutMarkConsumption(canvasRefs);

    // result — v1/v2 consumed together, v3 untouched
    expect(canvasRefs.newVectorCutVertexIdsRef.current).toEqual(new Set(['v3']));
  });

  it('should not crash when a touched-and-deselected vertex no longer exists in any open node (e.g. deleted via merge)', () => {
    // mock — 'gone' was touched earlier but has since been removed from the node entirely
    const nodeId = addVectorNode({ v3: { id: 'v3', x: 999, y: 999 } });

    store.dispatch(setVectorEditingNodeIds([nodeId]));

    const canvasRefs = createCanvasRefs();

    canvasRefs.newVectorCutVertexIdsRef.current = new Set(['gone', 'v3']);
    canvasRefs.touchedVectorCutVertexIdsRef.current = new Set(['gone']);
    canvasRefs.selectedVectorVertexIdsRef.current = [];

    // before
    resolveVectorCutMarkConsumption(canvasRefs);

    // result — no crash; the unresolvable id can't match any coincident position, including its own,
    // so it's left as-is (harmless — it no longer corresponds to any real vertex, so nothing renders it)
    expect(canvasRefs.newVectorCutVertexIdsRef.current).toEqual(new Set(['gone', 'v3']));
  });

  it('should clear both marks entirely once no node is left open for editing', () => {
    // mock — exiting vector edit mode
    store.dispatch(setVectorEditingNodeIds([]));
    const canvasRefs = createCanvasRefs();

    canvasRefs.newVectorCutVertexIdsRef.current = new Set(['v1', 'v2']);
    canvasRefs.touchedVectorCutVertexIdsRef.current = new Set(['v1']);

    // before
    resolveVectorCutMarkConsumption(canvasRefs);

    // result
    expect(canvasRefs.newVectorCutVertexIdsRef.current).toEqual(new Set());
    expect(canvasRefs.touchedVectorCutVertexIdsRef.current).toEqual(new Set());
  });
});
