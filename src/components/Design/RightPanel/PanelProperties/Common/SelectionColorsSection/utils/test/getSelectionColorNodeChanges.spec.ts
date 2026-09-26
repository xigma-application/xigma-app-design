// types
import { NodeType } from 'types/design/enums';
import { TFrameNode, TRectangleNode, TSceneNode } from 'types/design/types';
import { TSelectionColorOccurrence } from '../../types';

// utils
import { getSelectionColorNodeChanges } from '../getSelectionColorNodeChanges';
import { makeSquareVector } from 'utils/canvas/vector/stroke/test/fixtures';

const child: TRectangleNode = {
  fills: [{ color: '#ff0000', opacity: 100, type: 'solid' }],
  height: 10,
  id: 'child',
  name: 'Rectangle',
  parentId: 'frame',
  rotation: 0,
  type: NodeType.rectangle,
  width: 10,
  x: 0,
  y: 0,
};

const frame: TFrameNode = {
  childIds: ['child'],
  clipContent: true,
  fills: [{ color: '#ff0000', opacity: 100, type: 'solid' }],
  height: 100,
  id: 'frame',
  name: 'Frame',
  parentId: null,
  rotation: 0,
  strokes: [{ color: '#ff0000', opacity: 100, type: 'solid', visible: false }],
  type: NodeType.frame,
  width: 100,
  x: 0,
  y: 0,
};

const nodesById: Record<string, TSceneNode> = { child, frame };
const nextPaint = { color: '#00ff00', opacity: 100, type: 'solid' } as const;

describe('getSelectionColorNodeChanges', () => {
  it('should build one change per node, replacing the paint at every matched index and preserving its own visible flag', () => {
    // mock
    const occurrences: TSelectionColorOccurrence[] = [
      { index: 0, nodeId: 'frame', property: 'fills' },
      { index: 0, nodeId: 'child', property: 'fills' },
    ];

    // result
    expect(getSelectionColorNodeChanges(nodesById, occurrences, nextPaint)).toEqual([
      { changes: { fills: [{ ...nextPaint, visible: undefined }] }, nodeId: 'frame' },
      { changes: { fills: [{ ...nextPaint, visible: undefined }] }, nodeId: 'child' },
    ]);
  });

  it('should merge fills and strokes changes for the same node into one change object', () => {
    // mock
    const occurrences: TSelectionColorOccurrence[] = [
      { index: 0, nodeId: 'frame', property: 'fills' },
      { index: 0, nodeId: 'frame', property: 'strokes' },
    ];

    // result
    expect(getSelectionColorNodeChanges(nodesById, occurrences, nextPaint)).toEqual([
      {
        changes: {
          fills: [{ ...nextPaint, visible: undefined }],
          strokes: [{ ...nextPaint, visible: false }],
        },
        nodeId: 'frame',
      },
    ]);
  });

  it('should skip an occurrence pointing at a node that no longer exists', () => {
    // mock
    const occurrences: TSelectionColorOccurrence[] = [{ index: 0, nodeId: 'missing', property: 'fills' }];

    // result
    expect(getSelectionColorNodeChanges(nodesById, occurrences, nextPaint)).toEqual([]);
  });

  it('should leave every other paint in the array untouched', () => {
    // mock
    const other = { color: '#111111', opacity: 100, type: 'solid' as const };
    const multiFillFrame: TFrameNode = { ...frame, fills: [frame.fills[0], other] };
    const occurrences: TSelectionColorOccurrence[] = [{ index: 0, nodeId: 'frame', property: 'fills' }];

    // result
    expect(getSelectionColorNodeChanges({ frame: multiFillFrame }, occurrences, nextPaint)).toEqual([
      { changes: { fills: [{ ...nextPaint, visible: undefined }, other] }, nodeId: 'frame' },
    ]);
  });

  it('should skip an occurrence pointing at a node type that has no fills or strokes', () => {
    // mock
    const line = {
      height: 0,
      id: 'line',
      name: 'Line',
      parentId: null,
      rotation: 0,
      type: NodeType.line,
      width: 10,
      x: 0,
      y: 0,
    } as unknown as TSceneNode;
    const occurrences: TSelectionColorOccurrence[] = [{ index: 0, nodeId: 'line', property: 'fills' }];

    // result
    expect(getSelectionColorNodeChanges({ line }, occurrences, nextPaint)).toEqual([]);
  });

  it('should write a vector area color back into that area and its stroke color into its strokes', () => {
    // mock
    const red = [{ color: '#ff0000', opacity: 100, type: 'solid' as const }];
    const vector = makeSquareVector({ fillByKey: { f1: red, f2: red }, filledFaceKeys: ['f1', 'f2'], strokes: red });
    const occurrences: TSelectionColorOccurrence[] = [
      { faceKey: 'f1', index: 0, nodeId: 'vector', property: 'fills' },
      { faceKey: 'f2', index: 0, nodeId: 'vector', property: 'fills' },
      { index: 0, nodeId: 'vector', property: 'strokes' },
    ];

    // result
    expect(getSelectionColorNodeChanges({ vector }, occurrences, nextPaint)).toEqual([
      {
        changes: { fillByKey: { f1: [{ ...nextPaint }], f2: [{ ...nextPaint }] }, strokes: [{ ...nextPaint }] },
        nodeId: 'vector',
      },
    ]);
  });
});
