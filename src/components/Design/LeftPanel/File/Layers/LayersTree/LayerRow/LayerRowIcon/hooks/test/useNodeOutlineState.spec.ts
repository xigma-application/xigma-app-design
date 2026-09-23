import { act, renderHook } from '@testing-library/react';

// hooks
import { useNodeOutlineState } from '../useNodeOutlineState';

// others
import { NODE_SHAPE_ICON_REDRAW_DEBOUNCE_MS } from '../../constants';

// types
import { NodeType } from 'types/design/enums';
import { TRectangleNode, TSceneNode, TTextNode } from 'types/design/types';

const rectangleNode: TRectangleNode = {
  fills: [{ color: '#00ff00', opacity: 100, type: 'solid' }],
  height: 20,
  id: 'node-1',
  name: 'Rectangle',
  parentId: null,
  rotation: 0,
  type: NodeType.rectangle,
  width: 20,
  x: 0,
  y: 0,
};

const textNode: TTextNode = {
  content: 'Hi',
  fill: '#ffffff',
  flipX: false,
  flipY: false,
  fontFamily: 'Inter',
  fontSize: 14,
  height: 20,
  id: 'node-1',
  name: 'Text',
  parentId: null,
  rotation: 0,
  type: NodeType.text,
  width: 100,
  x: 0,
  y: 0,
};

describe('useNodeOutlineState', () => {
  it('should compute the outline synchronously on mount, with no pending state', () => {
    // before
    const { result } = renderHook(() => useNodeOutlineState(rectangleNode));

    // result
    expect(result.current.outline).not.toBeNull();
    expect(result.current.isOutlinePending).toBe(false);
  });

  it('should redraw immediately, with no pending state, when the node id changes', () => {
    // before
    const { rerender, result } = renderHook(({ node }: { node: TSceneNode }) => useNodeOutlineState(node), {
      initialProps: { node: textNode as TSceneNode },
    });

    // action
    rerender({ node: { ...rectangleNode, id: 'node-2' } });

    // result
    expect(result.current.outline).not.toBeNull();
    expect(result.current.isOutlinePending).toBe(false);
  });

  it('should flag the outline as pending while a same-id update is debounced, e.g. flattening a text node into a shape with an outline', () => {
    // mock
    vi.useFakeTimers();

    // before — same id, flips from a type with no outline (text) to one with an outline (rectangle)
    const { rerender, result } = renderHook(({ node }: { node: TSceneNode }) => useNodeOutlineState(node), {
      initialProps: { node: textNode as TSceneNode },
    });

    // action
    rerender({ node: { ...rectangleNode, id: textNode.id } });

    // result — pending, still no outline to show yet
    expect(result.current.outline).toBeNull();
    expect(result.current.isOutlinePending).toBe(true);

    // action
    act(() => vi.advanceTimersByTime(NODE_SHAPE_ICON_REDRAW_DEBOUNCE_MS));

    // result — the debounce fired, the outline is now available
    expect(result.current.outline).not.toBeNull();
    expect(result.current.isOutlinePending).toBe(false);

    // after
    vi.useRealTimers();
  });
});
