// types
import { NodeType } from 'types/design/enums';
import { TMaskRenderer } from '../../types';
import { TSceneNode } from 'types/design/types';

// utils
import { renderFrameNode } from '../renderFrameNode';
import { renderGroupNode } from '../renderGroupNode';
import { renderNode } from '../renderNode';
import { renderSectionNode } from '../renderSectionNode';

vi.mock('../renderGroupNode', () => ({ renderGroupNode: vi.fn() }));
vi.mock('../renderFrameNode', () => ({ renderFrameNode: vi.fn() }));
vi.mock('../renderSectionNode', () => ({ renderSectionNode: vi.fn() }));

const buildRenderer = (nodes: Record<string, Partial<TSceneNode>>): TMaskRenderer =>
  ({
    paintLeaf: vi.fn(),
    sceneNodeById: new Map(Object.entries(nodes) as [string, TSceneNode][]),
  }) as unknown as TMaskRenderer;

describe('renderNode', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should do nothing when the id is not in the visible scene', () => {
    const renderer = buildRenderer({});

    renderNode(renderer, 'missing', null);

    expect(renderer.paintLeaf).not.toHaveBeenCalled();
    expect(renderGroupNode).not.toHaveBeenCalled();
  });

  it('should delegate a group node to renderGroupNode', () => {
    const renderer = buildRenderer({ 'group-1': { id: 'group-1', type: NodeType.group } });

    renderNode(renderer, 'group-1', null);

    expect(renderGroupNode).toHaveBeenCalledWith(renderer, renderer.sceneNodeById.get('group-1'), null);
  });

  it('should delegate a frame node to renderFrameNode', () => {
    const renderer = buildRenderer({ 'frame-1': { id: 'frame-1', type: NodeType.frame } });

    renderNode(renderer, 'frame-1', null);

    expect(renderFrameNode).toHaveBeenCalledWith(renderer, renderer.sceneNodeById.get('frame-1'), null);
  });

  it('should delegate a section node to renderSectionNode', () => {
    const renderer = buildRenderer({ 'section-1': { id: 'section-1', type: NodeType.section } });

    renderNode(renderer, 'section-1', null);

    expect(renderSectionNode).toHaveBeenCalledWith(renderer, renderer.sceneNodeById.get('section-1'), null);
  });

  it('should paint any other node type as a plain leaf', () => {
    const rect = { id: 'rect-1', type: NodeType.rectangle };
    const renderer = buildRenderer({ 'rect-1': rect });

    renderNode(renderer, 'rect-1', null);

    expect(renderer.paintLeaf).toHaveBeenCalledWith(renderer.sceneNodeById.get('rect-1'));
    expect(renderGroupNode).not.toHaveBeenCalled();
    expect(renderFrameNode).not.toHaveBeenCalled();
    expect(renderSectionNode).not.toHaveBeenCalled();
  });
});
