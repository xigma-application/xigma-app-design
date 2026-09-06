import { RefObject } from 'react';

// types
import { NodeType } from 'types/design/enums';
import { TAutoLayoutReorderPreview } from 'types/design/canvas/types';
import { TPoint } from 'types/canvas';
import { TSceneNode } from 'types/design/types';

// utils
import { getDraggedBlockGhostPositions } from '../getDraggedBlockGhostPositions';

const SLOTS: Record<string, TPoint> = { c: { x: 0, y: 200 }, d: { x: 100, y: 200 } };

const node = (id: string, x: number, y: number): TSceneNode =>
  ({ height: 20, id, rotation: 0, type: NodeType.rectangle, width: 20, x, y }) as unknown as TSceneNode;

const preview = (): TAutoLayoutReorderPreview =>
  ({ activeIndex: 4, draggedGrabbedId: 'c', frameId: 'frame-1', positions: {} }) as unknown as TAutoLayoutReorderPreview;

const previewRef = (value: TAutoLayoutReorderPreview): RefObject<TAutoLayoutReorderPreview | null> => ({ current: value });

describe('getDraggedBlockGhostPositions', () => {
  it('should keep each companion in its own footprint slot while the grabbed member rides the cursor', () => {
    // mock
    const view = preview();
    const nodes = [node('c', 0, 100), node('d', 100, 100)];

    // before — 'c' dragged straight down onto its own slot
    const result = getDraggedBlockGhostPositions(previewRef(view), nodes, view, SLOTS, nodes[0], 0, 100);

    // result
    expect(result.positions).toEqual({ c: { x: 0, y: 200 }, d: { x: 100, y: 200 } });
  });

  it('should swap a companion into the grabbed member’s vacated slot when the cursor is over the companion’s slot', () => {
    // mock
    const view = preview();
    const nodes = [node('c', 0, 100), node('d', 100, 100)];

    // before — 'c' dragged onto 'd'’s slot
    const result = getDraggedBlockGhostPositions(previewRef(view), nodes, view, SLOTS, nodes[0], 100, 100);

    // result
    expect(result.positions).toEqual({ c: { x: 100, y: 200 }, d: { x: 0, y: 200 } });
  });

  it('should cursor-track a selected node that has no footprint slot', () => {
    // mock
    const view = preview();
    const nodes = [node('c', 0, 100), node('d', 100, 100), node('x', 300, 300)];

    // before
    const result = getDraggedBlockGhostPositions(previewRef(view), nodes, view, SLOTS, nodes[0], 5, 5);

    // result — 'x' just tracks the raw drag delta
    expect(result.positions.x).toEqual({ x: 305, y: 305 });
  });

  it('packs the block contiguously off the grabbed member, ignoring the swap, when the preview is marked contiguous', () => {
    // mock — chasm mode: slots are relative contiguous positions, not absolute footprint slots
    const view = {
      ...preview(),
      draggedContiguous: true,
    } as TAutoLayoutReorderPreview;
    const contiguousSlots: Record<string, TPoint> = { c: { x: 0, y: 0 }, d: { x: 120, y: 0 } };
    const nodes = [node('c', 0, 100), node('d', 100, 100)];

    // before — grabbed 'c' flung far to the right
    const result = getDraggedBlockGhostPositions(previewRef(view), nodes, view, contiguousSlots, nodes[0], 400, 0);

    // result — 'd' sits exactly one contiguous step (120) right of 'c', wherever 'c' is dragged
    expect(result.positions).toEqual({ c: { x: 400, y: 100 }, d: { x: 520, y: 100 } });
  });

  it('should return a tween describing the resolved target offsets', () => {
    // mock
    const view = preview();
    const nodes = [node('c', 0, 100), node('d', 100, 100)];

    // before
    const result = getDraggedBlockGhostPositions(previewRef(view), nodes, view, SLOTS, nodes[0], 0, 100);

    // result
    expect(result.tween?.target).toEqual({ c: { x: 0, y: 0 }, d: { x: 100, y: 0 } });
  });
});
