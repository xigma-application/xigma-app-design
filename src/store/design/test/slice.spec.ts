// others
import { DEFAULT_PAGE_NAME, DEFAULT_PAINT_COLOR } from '../constants';

// store
import slice, {
  addComment,
  addNode,
  addPage,
  cancelCommentDraft,
  createMaskGroup,
  deleteComment,
  deleteNode,
  deletePage,
  duplicatePage,
  groupNodes,
  moveNodes,
  moveNodesToPage,
  renamePage,
  reorderPages,
  replaceDesignSnapshot,
  replaceNode,
  setActionsPanelOpen,
  setActivePage,
  setActiveTool,
  setPaintColor,
  setPenActiveVertexId,
  setSelection,
  setVectorEditingNodeIds,
  setViewport,
  startCommentDraft,
  startTextEdit,
  stopTextEdit,
  toggleActionsPanelOpen,
  toggleNodeHidden,
  toggleNodeLocked,
  toggleNodeMask,
  toggleRulers,
  toggleUiHidden,
  toggleUiMinimized,
  ungroupNodes,
  updateCommentContent,
  updateEditingTextBoxPathStartOffset,
  updateNode,
  updateTextEditContent,
  updateTextEditSelection,
} from '../slice';

// types
import { NodeType, ToolName } from 'types/design/enums';
import { TFrameNode } from 'types/design/types';

const frameNodePayload: Omit<TFrameNode, 'id'> = {
  fill: '#ff0000',
  height: 100,
  name: 'Frame 1',
  parentId: null,
  rotation: 0,
  type: NodeType.frame,
  width: 200,
  x: 0,
  y: 0,
};

describe('design slice', () => {
  it('should return the initial state, with a single generated-id default page', () => {
    // before
    const state = slice(undefined, { type: 'unknown' });
    const { activePageId } = state;

    // result — the default page's id is generated (nanoid), not a fixed constant
    expect(activePageId).toEqual(expect.any(String));
    expect(state).toEqual({
      activePageId,
      activeTool: ToolName.default,
      areRulersVisible: false,
      commentDraftPosition: null,
      editingNodeId: null,
      editingSelectionChangedAt: 0,
      editingSelectionEnd: 0,
      editingSelectionStart: 0,
      editingTextBox: null,
      editingTextContent: '',
      isActionsPanelOpen: false,
      isUiHidden: false,
      isUiMinimized: false,
      lastFrameTool: ToolName.frame,
      lastMoreTool: null,
      lastMouseTool: ToolName.default,
      lastPenTool: ToolName.pen,
      lastShapeTool: ToolName.rectangle,
      lastTextTool: ToolName.text,
      pages: {
        [activePageId]: {
          comments: {},
          id: activePageId,
          name: DEFAULT_PAGE_NAME,
          nodes: {},
          paintColor: DEFAULT_PAINT_COLOR,
          rootOrder: [],
          selectedIds: [],
          viewport: { x: 0, y: 0, zoom: 1 },
        },
      },
      penActiveVertexId: null,
      vectorEditingNodeIds: [],
    });
  });

  it('should set the active tool', () => {
    // before
    const state = slice(undefined, setActiveTool(ToolName.frame));

    // result
    expect(state.activeTool).toBe(ToolName.frame);
  });

  it('should remember the last shape tool when switching to a shape tool', () => {
    // before
    const state = slice(undefined, setActiveTool(ToolName.ellipse));

    // result
    expect(state.lastShapeTool).toBe(ToolName.ellipse);
  });

  it('should keep the last shape tool when switching to a non-shape tool', () => {
    // before
    const withEllipse = slice(undefined, setActiveTool(ToolName.ellipse));

    // action
    const state = slice(withEllipse, setActiveTool(ToolName.default));

    // result
    expect(state.lastShapeTool).toBe(ToolName.ellipse);
  });

  it('should remember the last mouse tool when switching to the hand tool', () => {
    // before
    const state = slice(undefined, setActiveTool(ToolName.hand));

    // result
    expect(state.lastMouseTool).toBe(ToolName.hand);
  });

  it('should keep the last mouse tool when switching to a non-mouse tool', () => {
    // before
    const withHand = slice(undefined, setActiveTool(ToolName.hand));

    // action
    const state = slice(withHand, setActiveTool(ToolName.frame));

    // result
    expect(state.lastMouseTool).toBe(ToolName.hand);
  });

  it('should add a node with a generated id', () => {
    // before
    const state = slice(undefined, addNode(frameNodePayload));
    const [id] = state.pages[state.activePageId].rootOrder;

    // result
    expect(state.pages[state.activePageId].rootOrder).toHaveLength(1);
    expect(state.pages[state.activePageId].nodes[id]).toEqual({ ...frameNodePayload, id });
  });

  it('should update an existing node', () => {
    // before
    const withNode = slice(undefined, addNode(frameNodePayload));
    const [id] = withNode.pages[withNode.activePageId].rootOrder;

    // action
    const state = slice(withNode, updateNode({ changes: { width: 300 }, id }));

    // result
    expect((state.pages[state.activePageId].nodes[id] as TFrameNode).width).toBe(300);
  });

  it('should do nothing when updating a node that does not exist', () => {
    // before
    const state = slice(undefined, updateNode({ changes: { width: 300 }, id: 'missing' }));

    // result
    expect(state.pages[state.activePageId].nodes).toEqual({});
  });

  it('should replace an existing node in the active page', () => {
    // before
    const withNode = slice(undefined, addNode(frameNodePayload));
    const [id] = withNode.pages[withNode.activePageId].rootOrder;
    const replacement: TFrameNode = { ...frameNodePayload, fill: '#00ff00', id, width: 999 };

    // action
    const state = slice(withNode, replaceNode({ id, node: replacement }));

    // result
    expect(state.pages[state.activePageId].nodes[id]).toEqual(replacement);
  });

  it('should toggle a node locked state', () => {
    // before
    const withNode = slice(undefined, addNode(frameNodePayload));
    const [id] = withNode.pages[withNode.activePageId].rootOrder;

    // action
    const state = slice(withNode, toggleNodeLocked(id));

    // result
    expect(state.pages[state.activePageId].nodes[id].locked).toBe(true);
  });

  it('should do nothing when toggling the locked state of a node that does not exist', () => {
    // before
    const state = slice(undefined, toggleNodeLocked('missing'));

    // result
    expect(state.pages[state.activePageId].nodes).toEqual({});
  });

  it('should group the selected nodes and ungroup them again', () => {
    // before
    const withA = slice(undefined, addNode(frameNodePayload));
    const withB = slice(withA, addNode({ ...frameNodePayload, name: 'Frame 2' }));
    const ids = withB.pages[withB.activePageId].rootOrder;
    const selected = slice(withB, setSelection(ids));

    // action
    const grouped = slice(selected, groupNodes());
    const page = grouped.pages[grouped.activePageId];
    const [groupId] = page.selectedIds;

    // result
    expect(page.nodes[groupId].type).toBe(NodeType.group);
    expect(page.rootOrder).toEqual([groupId]);

    // action
    const ungrouped = slice(grouped, ungroupNodes([groupId]));

    // result
    expect(ungrouped.pages[ungrouped.activePageId].rootOrder).toEqual(ids);
    expect(ungrouped.pages[ungrouped.activePageId].nodes[groupId]).toBeUndefined();
  });

  it('should wrap the selection in a mask group and toggle the mask flag off again', () => {
    // before
    const withA = slice(undefined, addNode(frameNodePayload));
    const withB = slice(withA, addNode({ ...frameNodePayload, name: 'Frame 2' }));
    const ids = withB.pages[withB.activePageId].rootOrder;
    const selected = slice(withB, setSelection(ids));

    // action
    const masked = slice(selected, createMaskGroup());
    const page = masked.pages[masked.activePageId];
    const [groupId] = page.selectedIds;

    // result
    expect(page.nodes[groupId].type).toBe(NodeType.group);
    expect(page.nodes[groupId].name).toBe('Mask group');
    const maskChildId = (page.nodes[groupId] as { childIds: string[] }).childIds.at(-1)!;
    expect(page.nodes[maskChildId].isMask).toBe(true);

    // action
    const unmasked = slice(masked, toggleNodeMask(maskChildId));

    // result
    expect(unmasked.pages[unmasked.activePageId].nodes[maskChildId].isMask).toBe(false);
  });

  it('should do nothing when toggling the mask state of a node that does not exist', () => {
    // before
    const state = slice(undefined, toggleNodeMask('missing'));

    // result
    expect(state.pages[state.activePageId].nodes).toEqual({});
  });

  it('should toggle a node hidden state', () => {
    // before
    const withNode = slice(undefined, addNode(frameNodePayload));
    const [id] = withNode.pages[withNode.activePageId].rootOrder;

    // action
    const state = slice(withNode, toggleNodeHidden(id));

    // result
    expect(state.pages[state.activePageId].nodes[id].hidden).toBe(true);
  });

  it('should do nothing when toggling the hidden state of a node that does not exist', () => {
    // before
    const state = slice(undefined, toggleNodeHidden('missing'));

    // result
    expect(state.pages[state.activePageId].nodes).toEqual({});
  });

  it('should set the viewport', () => {
    // before
    const state = slice(undefined, setViewport({ x: 10, y: 20, zoom: 2 }));

    // result
    expect(state.pages[state.activePageId].viewport).toEqual({ x: 10, y: 20, zoom: 2 });
  });

  it('should set the selection', () => {
    // before
    const state = slice(undefined, setSelection(['a', 'b']));

    // result
    expect(state.pages[state.activePageId].selectedIds).toEqual(['a', 'b']);
  });

  it('should move nodes within the active page rootOrder', () => {
    // before — append two fresh nodes so their positions are known regardless of any pre-existing rootOrder
    const withFirst = slice(undefined, addNode(frameNodePayload));
    const withSecond = slice(withFirst, addNode(frameNodePayload));
    const rootOrderBefore = withSecond.pages[withSecond.activePageId].rootOrder;
    const [firstId, secondId] = rootOrderBefore.slice(-2);
    const fromIndex = rootOrderBefore.length - 2;
    const toIndex = rootOrderBefore.length - 1;

    // action
    const state = slice(withSecond, moveNodes({ nodeIds: [firstId], targetIndex: toIndex, targetParentId: null }));

    // result
    const rootOrderAfter = state.pages[state.activePageId].rootOrder;
    expect(rootOrderAfter[fromIndex]).toBe(secondId);
    expect(rootOrderAfter[toIndex]).toBe(firstId);
  });

  it('should move a node to another page, removing it from the source page and appending it to the target', () => {
    // mock — add a node on the first page, then a second page (which becomes active)
    const withNode = slice(undefined, addNode(frameNodePayload));
    const firstPageId = withNode.activePageId;
    const [nodeId] = withNode.pages[firstPageId].rootOrder;
    const withSecondPage = slice(withNode, addPage());
    const secondPageId = withSecondPage.activePageId;
    const backOnFirstPage = slice(withSecondPage, setActivePage(firstPageId));

    // action
    const state = slice(backOnFirstPage, moveNodesToPage({ nodeIds: [nodeId], targetPageId: secondPageId }));

    // result
    expect(state.pages[firstPageId].nodes[nodeId]).toBeUndefined();
    expect(state.pages[firstPageId].rootOrder).not.toContain(nodeId);
    expect(state.pages[secondPageId].nodes[nodeId]).toMatchObject(frameNodePayload);
    expect(state.pages[secondPageId].rootOrder).toContain(nodeId);
  });

  it('should delete a node', () => {
    // before
    const withNode = slice(undefined, addNode(frameNodePayload));
    const [id] = withNode.pages[withNode.activePageId].rootOrder;

    // action
    const state = slice(withNode, deleteNode(id));

    // result
    expect(state.pages[state.activePageId].nodes[id]).toBeUndefined();
    expect(state.pages[state.activePageId].rootOrder).toEqual([]);
  });

  it('should replace the whole design snapshot', () => {
    // mock
    const node = { ...frameNodePayload, id: 'node-1' };
    const initial = slice(undefined, { type: 'unknown' });
    const snapshotPage = {
      ...initial.pages[initial.activePageId],
      nodes: { [node.id]: node },
      rootOrder: [node.id],
      selectedIds: [node.id],
    };

    // before
    const state = slice(
      initial,
      replaceDesignSnapshot({
        activePageId: initial.activePageId,
        pages: { [initial.activePageId]: snapshotPage },
      }),
    );

    // result
    expect(state.pages[state.activePageId].nodes).toEqual({ [node.id]: node });
    expect(state.pages[state.activePageId].rootOrder).toEqual([node.id]);
    expect(state.pages[state.activePageId].selectedIds).toEqual([node.id]);
  });

  it('should set the active page', () => {
    // before
    const state = slice(undefined, setActivePage('page-2'));

    // result
    expect(state.activePageId).toBe('page-2');
  });

  it('should add a page with a generated id, a default name and make it active', () => {
    // mock
    const initial = slice(undefined, { type: 'unknown' });

    // before
    const state = slice(initial, addPage());
    const newPageId = state.activePageId;

    // result
    expect(newPageId).not.toBe(initial.activePageId);
    expect(Object.keys(state.pages)).toHaveLength(2);
    expect(state.pages[newPageId].name).toBe('Page 2');
    expect(state.pages[newPageId].id).toBe(newPageId);
  });

  it('should insert the added page right after the active page', () => {
    // mock
    const initial = slice(undefined, { type: 'unknown' });
    const firstId = initial.activePageId;
    const withSecond = slice(initial, addPage());
    const secondId = withSecond.activePageId;
    const withThird = slice(withSecond, addPage());
    const thirdId = withThird.activePageId;

    // before — go back to the first page, then add
    const reactivated = slice(withThird, setActivePage(firstId));
    const state = slice(reactivated, addPage());
    const insertedId = state.activePageId;

    // result
    expect(Object.keys(state.pages)).toEqual([firstId, insertedId, secondId, thirdId]);
  });

  it('should reorder pages', () => {
    // mock
    const initial = slice(undefined, { type: 'unknown' });
    const firstId = initial.activePageId;
    const withSecond = slice(initial, addPage());
    const secondId = withSecond.activePageId;
    const withThird = slice(withSecond, addPage());
    const thirdId = withThird.activePageId;

    // before
    const state = slice(withThird, reorderPages({ fromIndex: 0, toIndex: 2 }));

    // result
    expect(Object.keys(state.pages)).toEqual([secondId, thirdId, firstId]);
    expect(state.activePageId).toBe(thirdId);
  });

  it('should rename a page', () => {
    // mock
    const initial = slice(undefined, { type: 'unknown' });

    // before
    const state = slice(initial, renamePage({ id: initial.activePageId, name: 'Renamed page' }));

    // result
    expect(state.pages[initial.activePageId].name).toBe('Renamed page');
  });

  it('should delete a page and re-point the active page', () => {
    // mock
    const initial = slice(undefined, { type: 'unknown' });
    const firstId = initial.activePageId;
    const withSecond = slice(initial, addPage());
    const secondId = withSecond.activePageId;

    // before
    const state = slice(withSecond, deletePage(secondId));

    // result
    expect(Object.keys(state.pages)).toEqual([firstId]);
    expect(state.activePageId).toBe(firstId);
  });

  it('should not delete the last remaining page', () => {
    // mock
    const initial = slice(undefined, { type: 'unknown' });

    // before
    const state = slice(initial, deletePage(initial.activePageId));

    // result
    expect(Object.keys(state.pages)).toHaveLength(1);
  });

  it('should duplicate a page after the source, remap its node ids and make the copy active', () => {
    // mock
    const initial = slice(undefined, { type: 'unknown' });
    const sourceId = initial.activePageId;
    const withFrame = slice(initial, addNode(frameNodePayload));
    const [frameId] = withFrame.pages[sourceId].rootOrder;
    const withChild = slice(withFrame, addNode({ ...frameNodePayload, name: 'Child', parentId: frameId }));
    const childId = withChild.pages[sourceId].rootOrder[1];

    // before
    const state = slice(
      withChild,
      duplicatePage({ newPageId: 'copy-1', nodeIdMap: { [childId]: 'child-copy', [frameId]: 'frame-copy' }, sourceId }),
    );

    // result
    expect(Object.keys(state.pages)).toEqual([sourceId, 'copy-1']);
    expect(state.activePageId).toBe('copy-1');
    expect(state.pages['copy-1'].name).toBe('Page 1 copy');
    expect(state.pages['copy-1'].rootOrder).toEqual(['frame-copy', 'child-copy']);
    expect(state.pages['copy-1'].nodes['child-copy'].parentId).toBe('frame-copy');
    expect(state.pages[sourceId].rootOrder).toEqual([frameId, childId]);
  });

  it('should set the paint color', () => {
    // before
    const state = slice(undefined, setPaintColor('#ff0000'));

    // result
    expect(state.pages[state.activePageId].paintColor).toBe('#ff0000');
  });

  it('should set the pen active vertex id', () => {
    // before
    const state = slice(undefined, setPenActiveVertexId('vertex-1'));

    // result
    expect(state.penActiveVertexId).toBe('vertex-1');
  });

  it('should set the vector editing node ids', () => {
    // before
    const state = slice(undefined, setVectorEditingNodeIds(['node-1']));

    // result
    expect(state.vectorEditingNodeIds).toEqual(['node-1']);
  });

  it('should start editing a text box', () => {
    // before
    const state = slice(
      undefined,
      startTextEdit({ box: { flipX: false, flipY: false, height: 20, rotation: 0, width: 100, x: 10, y: 10 } }),
    );

    // result
    expect(state.editingTextBox).toEqual({ flipX: false, flipY: false, height: 20, rotation: 0, width: 100, x: 10, y: 10 });
  });

  it('should reset the editing content when starting to edit a text box', () => {
    // before
    const withContent = slice(
      undefined,
      startTextEdit({ box: { flipX: false, flipY: false, height: 20, rotation: 0, width: 100, x: 10, y: 10 } }),
    );
    const typed = slice(withContent, updateTextEditContent('hello'));

    // action
    const state = slice(typed, startTextEdit({ box: { flipX: false, flipY: false, height: 30, rotation: 0, width: 200, x: 0, y: 0 } }));

    // result
    expect(state.editingTextContent).toBe('');
  });

  it('should stop editing a text box', () => {
    // before
    const editing = slice(
      undefined,
      startTextEdit({ box: { flipX: false, flipY: false, height: 20, rotation: 0, width: 100, x: 10, y: 10 } }),
    );

    // action
    const state = slice(editing, stopTextEdit());

    // result
    expect(state.editingTextBox).toBeNull();
    expect(state.editingTextContent).toBe('');
  });

  it('should set the Actions panel open flag', () => {
    // action
    const opened = slice(undefined, setActionsPanelOpen(true));

    // result
    expect(opened.isActionsPanelOpen).toBe(true);

    // action
    const closed = slice(opened, setActionsPanelOpen(false));

    // result
    expect(closed.isActionsPanelOpen).toBe(false);
  });

  it('should toggle the Actions panel open flag', () => {
    // action
    const opened = slice(undefined, toggleActionsPanelOpen());

    // result
    expect(opened.isActionsPanelOpen).toBe(true);

    // action
    const closed = slice(opened, toggleActionsPanelOpen());

    // result
    expect(closed.isActionsPanelOpen).toBe(false);
  });

  it('should toggle the minimized UI flag', () => {
    // action
    const minimized = slice(undefined, toggleUiMinimized());

    // result
    expect(minimized.isUiMinimized).toBe(true);

    // action
    const expanded = slice(minimized, toggleUiMinimized());

    // result
    expect(expanded.isUiMinimized).toBe(false);
  });

  it('should toggle the hidden UI flag', () => {
    // action
    const hidden = slice(undefined, toggleUiHidden());

    // result
    expect(hidden.isUiHidden).toBe(true);

    // action
    const shown = slice(hidden, toggleUiHidden());

    // result
    expect(shown.isUiHidden).toBe(false);
  });

  it('should toggle the rulers visibility flag', () => {
    // action
    const visible = slice(undefined, toggleRulers());

    // result
    expect(visible.areRulersVisible).toBe(true);

    // action
    const hiddenAgain = slice(visible, toggleRulers());

    // result
    expect(hiddenAgain.areRulersVisible).toBe(false);
  });

  it('should update the live text edit content', () => {
    // before
    const editing = slice(
      undefined,
      startTextEdit({ box: { flipX: false, flipY: false, height: 20, rotation: 0, width: 100, x: 10, y: 10 } }),
    );

    // action
    const state = slice(editing, updateTextEditContent('hello'));

    // result
    expect(state.editingTextContent).toBe('hello');
  });

  it('should record the node id and seed its content when starting to edit an existing text node', () => {
    // before
    const state = slice(
      undefined,
      startTextEdit({
        box: { flipX: false, flipY: false, height: 20, rotation: 0, width: 100, x: 10, y: 10 },
        content: 'hello',
        id: 'node-1',
      }),
    );

    // result
    expect(state.editingNodeId).toBe('node-1');
    expect(state.editingTextContent).toBe('hello');
  });

  it('should update the live text edit selection', () => {
    // mock
    vi.spyOn(Date, 'now').mockReturnValue(12345);

    // before
    const state = slice(undefined, updateTextEditSelection({ end: 5, start: 2 }));

    // result
    expect(state.editingSelectionStart).toBe(2);
    expect(state.editingSelectionEnd).toBe(5);
    expect(state.editingSelectionChangedAt).toBe(12345);

    // after
    vi.restoreAllMocks();
  });

  it('should update the editing text box path start offset', () => {
    // before
    const editing = slice(
      undefined,
      startTextEdit({ box: { flipX: false, flipY: false, height: 20, rotation: 0, width: 100, x: 10, y: 10 } }),
    );

    // action
    const state = slice(editing, updateEditingTextBoxPathStartOffset(0.5));

    // result
    expect(state.editingTextBox?.pathStartOffset).toBe(0.5);
  });

  it('should start a comment draft at a given position', () => {
    // before
    const state = slice(undefined, startCommentDraft({ x: 10, y: 20 }));

    // result
    expect(state.commentDraftPosition).toEqual({ x: 10, y: 20 });
  });

  it('should cancel a comment draft', () => {
    // before
    const withDraft = slice(undefined, startCommentDraft({ x: 10, y: 20 }));

    // action
    const state = slice(withDraft, cancelCommentDraft());

    // result
    expect(state.commentDraftPosition).toBeNull();
  });

  it('should add a comment at the draft position with a generated id, then clear the draft', () => {
    // before
    const withDraft = slice(undefined, startCommentDraft({ x: 10, y: 20 }));

    // action
    const state = slice(withDraft, addComment('hello'));
    const [id] = Object.keys(state.pages[state.activePageId].comments);

    // result
    expect(state.pages[state.activePageId].comments[id]).toMatchObject({ content: 'hello', id, x: 10, y: 20 });
    expect(state.commentDraftPosition).toBeNull();
  });

  it('should do nothing when adding a comment without an open draft', () => {
    // before
    const state = slice(undefined, addComment('hello'));

    // result
    expect(state.pages[state.activePageId].comments).toEqual({});
  });

  it('should update an existing comment content', () => {
    // before
    const withDraft = slice(undefined, startCommentDraft({ x: 10, y: 20 }));
    const withComment = slice(withDraft, addComment('hello'));
    const [id] = Object.keys(withComment.pages[withComment.activePageId].comments);

    // action
    const state = slice(withComment, updateCommentContent({ content: 'updated', id }));

    // result
    expect(state.pages[state.activePageId].comments[id].content).toBe('updated');
  });

  it('should do nothing when updating a comment that does not exist', () => {
    // before
    const state = slice(undefined, updateCommentContent({ content: 'updated', id: 'missing' }));

    // result
    expect(state.pages[state.activePageId].comments).toEqual({});
  });

  it('should delete a comment', () => {
    // before
    const withDraft = slice(undefined, startCommentDraft({ x: 10, y: 20 }));
    const withComment = slice(withDraft, addComment('hello'));
    const [id] = Object.keys(withComment.pages[withComment.activePageId].comments);

    // action
    const state = slice(withComment, deleteComment(id));

    // result
    expect(state.pages[state.activePageId].comments).toEqual({});
  });
});
