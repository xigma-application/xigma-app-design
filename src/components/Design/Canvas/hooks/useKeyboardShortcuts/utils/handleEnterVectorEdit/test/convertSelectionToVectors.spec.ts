// types
import { NodeType } from 'types/design/enums';
import { TRectangleNode, TTextNode, TVectorNode } from 'types/design/types';
import { TTextFlattenTarget } from '../../getTextFlattenTargets';

const convertedVector: TVectorNode = {
  defaultFill: [{ color: '#00ff00', opacity: 100, type: 'solid' }],
  filledFaceKeys: ['f1'],
  id: 'converted',
  name: 'Rectangle',
  parentId: null,
  rotation: 0,
  segments: {},
  strokeColor: '',
  strokeWidth: 0,
  type: NodeType.vector,
  vertexHandleModes: {},
  vertices: {},
};

const convertNodeToVectorMock = vi.fn((...args: unknown[]): TVectorNode => {
  void args;

  return convertedVector;
});

vi.mock('utils/canvas/vectorNetwork/convertShapeToVector/convertNodeToVector', () => ({
  convertNodeToVector: (...args: unknown[]): unknown => convertNodeToVectorMock(...args),
}));

// store
import { deleteNode, replaceNode } from 'store/design/slice';
import { beginHistoryGesture, endHistoryGesture } from 'store/history/actions';
import { getVectorSelectionSnapshot } from 'store/history/getVectorSelectionSnapshot';

// utils
import { convertSelectionToVectors } from '../convertSelectionToVectors';
import { createCanvasRefs } from '../../../../useCanvasRefs/createCanvasRefs';

const rectangleNode: TRectangleNode = {
  fill: '#00ff00',
  height: 40,
  id: 'r1',
  name: 'Rectangle',
  parentId: null,
  rotation: 0,
  type: NodeType.rectangle,
  width: 40,
  x: 0,
  y: 0,
};

const flattenedVector: TVectorNode = {
  defaultFill: [{ color: '#000000', opacity: 100, type: 'solid' }],
  filledFaceKeys: [],
  id: 'flattened-vector',
  name: 'Text',
  parentId: null,
  rotation: 0,
  segments: {},
  strokeColor: '',
  strokeWidth: 0,
  type: NodeType.vector,
  vertexHandleModes: {},
  vertices: {},
};

const textNode = (id: string, pathId: string | null = null): TTextNode => ({
  content: 'Hi',
  fill: '#ffffff',
  flipX: false,
  flipY: false,
  fontFamily: 'Inter',
  fontSize: 14,
  height: 40,
  id,
  name: 'Text',
  parentId: null,
  pathId,
  rotation: 0,
  type: NodeType.text,
  width: 200,
  x: 0,
  y: 0,
});

const target = (id: string, pathId: string | null = null): TTextFlattenTarget => ({ node: textNode(id, pathId), vector: flattenedVector });

describe('convertSelectionToVectors', () => {
  it('should dispatch nothing when there is nothing to convert and no text targets', () => {
    const dispatch = vi.fn();

    convertSelectionToVectors(dispatch, createCanvasRefs(), [], []);

    expect(dispatch).not.toHaveBeenCalled();
  });

  it('should wrap a shape conversion in a history gesture and replace it with its vector conversion', () => {
    const dispatch = vi.fn();
    const refs = createCanvasRefs();

    convertSelectionToVectors(dispatch, refs, [rectangleNode], []);

    expect(dispatch).toHaveBeenNthCalledWith(1, beginHistoryGesture(getVectorSelectionSnapshot(refs)));
    expect(dispatch).toHaveBeenNthCalledWith(2, replaceNode({ id: 'r1', node: convertedVector }));
    expect(dispatch).toHaveBeenLastCalledWith(endHistoryGesture());
    expect(convertNodeToVectorMock).toHaveBeenCalledWith(rectangleNode);
  });

  it('should replace a flattened text node with its vector, keeping the original id', () => {
    const dispatch = vi.fn();
    const refs = createCanvasRefs();

    convertSelectionToVectors(dispatch, refs, [], [target('t1')]);

    expect(dispatch).toHaveBeenCalledWith(replaceNode({ id: 't1', node: { ...flattenedVector, id: 't1' } }));
  });

  it('should delete the orphaned path node when the flattened text was bound to one', () => {
    const dispatch = vi.fn();
    const refs = createCanvasRefs();

    convertSelectionToVectors(dispatch, refs, [], [target('t1', 'path-1')]);

    expect(dispatch).toHaveBeenCalledWith(deleteNode('path-1'));
  });

  it('should not dispatch a delete when the flattened text had no bound path', () => {
    const dispatch = vi.fn();
    const refs = createCanvasRefs();

    convertSelectionToVectors(dispatch, refs, [], [target('t1')]);

    expect(dispatch).not.toHaveBeenCalledWith(deleteNode(expect.anything()));
  });

  it('should still open a history gesture when there are text targets but no shapes to convert', () => {
    const dispatch = vi.fn();
    const refs = createCanvasRefs();

    convertSelectionToVectors(dispatch, refs, [], [target('t1')]);

    expect(dispatch).toHaveBeenNthCalledWith(1, beginHistoryGesture(getVectorSelectionSnapshot(refs)));
    expect(dispatch).toHaveBeenLastCalledWith(endHistoryGesture());
  });
});
