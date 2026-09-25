// types
import { LayoutMode, NodeType, SizingMode, ToolName } from 'types/design/enums';
import { TDesignState } from '../../../types';
import { TFrameNode, TLineNode, TRectangleNode } from 'types/design/types';

// utils
import { applyNewNodeGridPlacement } from '../applyNewNodeGridPlacement';

const rect = (id: string, column: number, row: number): TRectangleNode => ({
  fills: [],
  gridColumnAnchorIndex: column,
  gridRowAnchorIndex: row,
  height: 10,
  id,
  name: id,
  parentId: 'grid-1',
  rotation: 0,
  type: NodeType.rectangle,
  width: 10,
  x: 0,
  y: 0,
});

const line = (id: string): TLineNode => ({
  id,
  name: id,
  parentId: 'grid-1',
  strokes: [{ color: '#000000', opacity: 100, type: 'solid' }],
  type: NodeType.line,
  x1: 0,
  x2: 10,
  y1: 0,
  y2: 0,
});

const frame: TFrameNode = {
  childIds: ['occupant', 'new-node'],
  clipContent: true,
  fills: [],
  gridAutoPlacement: true,
  gridColumnCount: 2,
  height: 200,
  id: 'grid-1',
  layoutMode: LayoutMode.grid,
  name: 'Frame',
  parentId: null,
  rotation: 0,
  type: NodeType.frame,
  width: 200,
  x: 0,
  y: 0,
};

const buildState = (): TDesignState =>
  ({
    activePageId: 'page-1',
    activeTool: ToolName.default,
    pages: {
      'page-1': {
        id: 'page-1',
        nodes: {
          'grid-1': { ...frame },
          'new-node': rect('new-node', 0, 0),
          occupant: rect('occupant', 0, 0),
        },
        rootOrder: ['grid-1'],
      },
    },
  }) as unknown as TDesignState;

describe('applyNewNodeGridPlacement', () => {
  it('should place the new node at the target cell, shift the occupant out of the way, and switch the frame to explicit placement', () => {
    // mock
    const state = buildState();
    const page = state.pages[state.activePageId];
    const frameNode = page.nodes['grid-1'] as TFrameNode;

    // before — insertIndex 0 with one existing occupant already at cell (0,0)
    applyNewNodeGridPlacement(state, frameNode, 'new-node', 0);

    // result
    const newNode = page.nodes['new-node'] as TRectangleNode;
    const occupant = page.nodes.occupant as TRectangleNode;

    expect(frameNode.gridAutoPlacement).toBe(false);
    expect(newNode.gridColumnAnchorIndex).toBe(0);
    expect(newNode.gridRowAnchorIndex).toBe(0);
    expect(newNode.heightSizingMode).toBe(SizingMode.fill);
    expect(newNode.widthSizingMode).toBe(SizingMode.fill);
    expect(occupant.gridColumnAnchorIndex).toBe(1);
    expect(occupant.gridRowAnchorIndex).toBe(0);
  });

  it('should leave a non-box new node (e.g. a line) without grid anchor fields', () => {
    // mock
    const state = buildState();
    const page = state.pages[state.activePageId];
    const frameNode = page.nodes['grid-1'] as TFrameNode;

    page.nodes['new-node'] = line('new-node');

    // before
    applyNewNodeGridPlacement(state, frameNode, 'new-node', 0);

    // result
    expect(page.nodes['new-node']).not.toHaveProperty('gridColumnAnchorIndex');
    expect(frameNode.gridAutoPlacement).toBe(false);
  });

  it('should leave a non-box shifted sibling (e.g. a line) without grid anchor fields', () => {
    // mock
    const state = buildState();
    const page = state.pages[state.activePageId];
    const frameNode = page.nodes['grid-1'] as TFrameNode;

    page.nodes.occupant = line('occupant');

    // before
    applyNewNodeGridPlacement(state, frameNode, 'new-node', 0);

    // result
    expect(page.nodes.occupant).not.toHaveProperty('gridColumnAnchorIndex');
  });
});
