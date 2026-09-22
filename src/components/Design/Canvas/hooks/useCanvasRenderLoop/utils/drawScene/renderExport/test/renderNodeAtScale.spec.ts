// types
import { NodeType } from 'types/design/enums';
import { TDrawSceneContext } from '../../types';
import { TSceneNode } from 'types/design/types';

// utils
import { createCanvasRefs } from '../../../../../useCanvasRefs/createCanvasRefs';
import { renderNodeAtScale } from '../renderNodeAtScale';

const drawLeafNodeMock = vi.fn();
const renderExportTargetMock = vi.fn();

vi.mock('../../drawLeafNode', () => ({ drawLeafNode: (...args: unknown[]): void => drawLeafNodeMock(...args) }));
vi.mock('../renderExportTarget', () => ({
  renderExportTarget: (...args: unknown[]): unknown => renderExportTargetMock(...args),
}));

const rect = (id: string, overrides: Partial<TSceneNode> = {}): TSceneNode =>
  ({
    fills: [],
    height: 20,
    id,
    name: id,
    parentId: null,
    rotation: 0,
    type: NodeType.rectangle,
    width: 20,
    x: 0,
    y: 0,
    ...overrides,
  }) as TSceneNode;

describe('renderNodeAtScale', () => {
  const refs = createCanvasRefs();
  const context = {} as TDrawSceneContext;

  beforeEach(() => {
    drawLeafNodeMock.mockClear();
    renderExportTargetMock.mockClear();
  });

  it('should delegate the target lifecycle to renderExportTarget, forwarding sourceNodeId/nodesById/scale/boundsOverride', () => {
    // mock
    const pixels = { height: 10, pixels: new Uint8Array(4), width: 10 };
    const nodesById = { r1: rect('r1') };
    const boundsOverride = { height: 5, width: 5, x: 0, y: 0 };

    renderExportTargetMock.mockReturnValue(pixels);

    // before
    const result = renderNodeAtScale(context, 'r1', [], nodesById, refs, 2, boundsOverride);

    // result
    expect(renderExportTargetMock).toHaveBeenCalledWith(context, 'r1', nodesById, 2, boundsOverride, expect.any(Function), undefined);
    expect(result).toBe(pixels);
  });

  it('should forward an explicit backgroundColor through to renderExportTarget (whole-page export needs it to seed the page background)', () => {
    // mock
    const boundsOverride = { height: 5, width: 5, x: 0, y: 0 };
    const backgroundColor = [0.2, 0.2, 0.2, 1] as const;

    renderExportTargetMock.mockReturnValue(null);

    // before — sourceNodeId is null, matching a whole-page export with no single root node
    renderNodeAtScale(context, null, [], {}, refs, 2, boundsOverride, backgroundColor);

    // result
    expect(renderExportTargetMock).toHaveBeenCalledWith(context, null, {}, 2, boundsOverride, expect.any(Function), backgroundColor);
  });

  it('should draw exactly the given node list, flatly, via the shared leaf drawer', () => {
    // mock — an unrelated sibling passed in nodesToDraw, absent from the source node's own children,
    // proves the caller (not this function) decides which nodes end up on the canvas
    const source = rect('r1');
    const sibling = rect('r2', { x: 50 });
    const nodesById = { r1: source, r2: sibling };
    const drawnContext = { canvasHeight: 20, canvasWidth: 20 } as TDrawSceneContext;

    renderExportTargetMock.mockImplementation((...args: unknown[]) => {
      const draw = args[5] as (renderContext: TDrawSceneContext) => void;
      draw(drawnContext);
      return null;
    });

    // before
    renderNodeAtScale(context, 'r1', [sibling], nodesById, refs, 1);

    // result
    expect(drawLeafNodeMock).toHaveBeenCalledTimes(1);
    expect(drawLeafNodeMock).toHaveBeenCalledWith(drawnContext, sibling, new Map(), refs, nodesById, null, 0);
  });
});
