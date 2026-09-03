// types
import { NodeType } from 'types/design/enums';
import { TFrameNode, TVectorNode } from 'types/design/types';

// utils
import { forEachClipboardTargetPair } from '../forEachClipboardTargetPair';

const buildFrame = (overrides: Partial<TFrameNode>): TFrameNode => ({
  fill: '#ff0000',
  height: 10,
  id: 'frame-1',
  name: 'Frame',
  parentId: null,
  rotation: 0,
  type: NodeType.frame,
  width: 10,
  x: 0,
  y: 0,
  ...overrides,
});

const buildVector = (overrides: Partial<TVectorNode>): TVectorNode => ({
  defaultFill: null,
  filledFaceKeys: [],
  id: 'vector-1',
  name: 'Vector',
  parentId: null,
  rotation: 0,
  segments: {},
  strokeColor: '#000000',
  strokeWidth: 1,
  type: NodeType.vector,
  vertexHandleModes: {},
  vertices: {},
  ...overrides,
});

describe('forEachClipboardTargetPair', () => {
  it('should pair every selected target with the single clipboard root when only one was copied', () => {
    // mock
    const clip = buildFrame({ id: 'clip-1' });
    const targetA = buildFrame({ id: 'target-a' });
    const targetB = buildFrame({ id: 'target-b' });
    const callback = vi.fn();

    // action
    forEachClipboardTargetPair(
      ['target-a', 'target-b'],
      ['clip-1'],
      { 'clip-1': clip },
      { 'target-a': targetA, 'target-b': targetB },
      callback,
    );

    // result
    expect(callback).toHaveBeenCalledTimes(2);
    expect(callback).toHaveBeenNthCalledWith(1, targetA, clip, 'target-a');
    expect(callback).toHaveBeenNthCalledWith(2, targetB, clip, 'target-b');
  });

  it('should pair multiple clipboard roots with multiple selected targets by index', () => {
    // mock
    const clipA = buildFrame({ id: 'clip-a' });
    const clipB = buildFrame({ id: 'clip-b' });
    const targetA = buildFrame({ id: 'target-a' });
    const targetB = buildFrame({ id: 'target-b' });
    const callback = vi.fn();

    // action
    forEachClipboardTargetPair(
      ['target-a', 'target-b'],
      ['clip-a', 'clip-b'],
      { 'clip-a': clipA, 'clip-b': clipB },
      { 'target-a': targetA, 'target-b': targetB },
      callback,
    );

    // result
    expect(callback).toHaveBeenNthCalledWith(1, targetA, clipA, 'target-a');
    expect(callback).toHaveBeenNthCalledWith(2, targetB, clipB, 'target-b');
  });

  it('should skip a target whose index has no matching clipboard root — callers gate this case via canReplaceSelectionWithClipboard', () => {
    // mock — 2 clipboard roots, 3 selected targets: the loop itself just pairs by index, index 2 has nothing to pair with
    const clipA = buildFrame({ id: 'clip-a' });
    const clipB = buildFrame({ id: 'clip-b' });
    const targetA = buildFrame({ id: 'target-a' });
    const targetB = buildFrame({ id: 'target-b' });
    const targetC = buildFrame({ id: 'target-c' });
    const callback = vi.fn();

    // action
    forEachClipboardTargetPair(
      ['target-a', 'target-b', 'target-c'],
      ['clip-a', 'clip-b'],
      { 'clip-a': clipA, 'clip-b': clipB },
      { 'target-a': targetA, 'target-b': targetB, 'target-c': targetC },
      callback,
    );

    // result
    expect(callback).toHaveBeenCalledTimes(2);
    expect(callback).toHaveBeenNthCalledWith(1, targetA, clipA, 'target-a');
    expect(callback).toHaveBeenNthCalledWith(2, targetB, clipB, 'target-b');
  });

  it('should skip a target that has no plain x/y anchor, such as a vector node', () => {
    // mock
    const clip = buildFrame({ id: 'clip-1' });
    const vector = buildVector({ id: 'vector-1' });
    const callback = vi.fn();

    // action
    forEachClipboardTargetPair(['vector-1'], ['clip-1'], { 'clip-1': clip }, { 'vector-1': vector }, callback);

    // result
    expect(callback).not.toHaveBeenCalled();
  });

  it('should skip a clipboard root that has no plain x/y anchor, such as a vector node', () => {
    // mock
    const clip = buildVector({ id: 'clip-1' });
    const target = buildFrame({ id: 'target-1' });
    const callback = vi.fn();

    // action
    forEachClipboardTargetPair(['target-1'], ['clip-1'], { 'clip-1': clip }, { 'target-1': target }, callback);

    // result
    expect(callback).not.toHaveBeenCalled();
  });

  it('should skip a target id that no longer resolves to a node', () => {
    // mock
    const clip = buildFrame({ id: 'clip-1' });
    const callback = vi.fn();

    // action
    forEachClipboardTargetPair(['missing-target'], ['clip-1'], { 'clip-1': clip }, {}, callback);

    // result
    expect(callback).not.toHaveBeenCalled();
  });
});
