// types
import { NodeType } from 'types/design/enums';
import { TMaskRenderer } from '../../types';
import { TSceneNode } from 'types/design/types';

// utils
import { dispatchNodeType } from '../dispatchNodeType';
import { renderFrameNode } from '../renderFrameNode';
import { renderGroupNode } from '../renderGroupNode';
import { renderMaskNode } from '../renderMaskNode';
import { renderSectionNode } from '../renderSectionNode';

vi.mock('../renderGroupNode', () => ({ renderGroupNode: vi.fn() }));
vi.mock('../renderMaskNode', () => ({ renderMaskNode: vi.fn() }));
vi.mock('../renderFrameNode', () => ({ renderFrameNode: vi.fn() }));
vi.mock('../renderSectionNode', () => ({ renderSectionNode: vi.fn() }));

const buildRenderer = (): TMaskRenderer => ({ paintLeaf: vi.fn() }) as unknown as TMaskRenderer;

describe('dispatchNodeType', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should delegate a group node to renderGroupNode', () => {
    const renderer = buildRenderer();
    const node = { type: NodeType.group } as unknown as TSceneNode;

    dispatchNodeType(renderer, node, null);

    expect(renderGroupNode).toHaveBeenCalledWith(renderer, node, null);
  });

  it('should delegate a mask node to renderMaskNode', () => {
    const renderer = buildRenderer();
    const node = { type: NodeType.mask } as unknown as TSceneNode;

    dispatchNodeType(renderer, node, null);

    expect(renderMaskNode).toHaveBeenCalledWith(renderer, node, null);
  });

  it('should delegate a frame node to renderFrameNode', () => {
    const renderer = buildRenderer();
    const node = { type: NodeType.frame } as unknown as TSceneNode;

    dispatchNodeType(renderer, node, null);

    expect(renderFrameNode).toHaveBeenCalledWith(renderer, node, null);
  });

  it('should delegate a section node to renderSectionNode', () => {
    const renderer = buildRenderer();
    const node = { type: NodeType.section } as unknown as TSceneNode;

    dispatchNodeType(renderer, node, null);

    expect(renderSectionNode).toHaveBeenCalledWith(renderer, node, null);
  });

  it('should paint any other node type as a plain leaf', () => {
    const renderer = buildRenderer();
    const node = { type: NodeType.rectangle } as unknown as TSceneNode;

    dispatchNodeType(renderer, node, null);

    expect(renderer.paintLeaf).toHaveBeenCalledWith(node);
    expect(renderGroupNode).not.toHaveBeenCalled();
    expect(renderFrameNode).not.toHaveBeenCalled();
    expect(renderSectionNode).not.toHaveBeenCalled();
  });
});
