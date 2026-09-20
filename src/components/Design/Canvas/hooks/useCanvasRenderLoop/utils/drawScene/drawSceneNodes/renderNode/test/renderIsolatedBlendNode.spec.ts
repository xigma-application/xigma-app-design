// types
import { BlendMode, NodeType } from 'types/design/enums';
import { TMaskRenderer } from '../../types';
import { TRenderTarget } from 'utils/canvas/renderTarget/createRenderTargetPool/types';
import { TSceneNode } from 'types/design/types';

// utils
import { bindTarget } from '../../bindTarget';
import { captureBackdropTexture } from '../../captureBackdropTexture';
import { compositeBlend } from '../../../compositeBlend';
import { createCanvasRefs } from 'components/Design/Canvas/hooks/useCanvasRefs/createCanvasRefs';
import { paintIsolatedContent } from '../paintIsolatedContent';
import { renderIntoTarget } from '../../renderIntoTarget';
import { renderIsolatedBlendNode } from '../renderIsolatedBlendNode';

vi.mock('../../bindTarget', () => ({ bindTarget: vi.fn() }));
vi.mock('../../captureBackdropTexture', () => ({ captureBackdropTexture: vi.fn() }));
vi.mock('../../../compositeBlend', () => ({ compositeBlend: vi.fn() }));
vi.mock('../paintIsolatedContent', () => ({ paintIsolatedContent: vi.fn() }));
vi.mock('../../renderIntoTarget', () => ({ renderIntoTarget: vi.fn((_renderer, _target, paint) => paint()) }));

const gl = { SCISSOR_TEST: 3089, disable: vi.fn(), enable: vi.fn(), scissor: vi.fn() } as unknown as WebGL2RenderingContext;

describe('renderIsolatedBlendNode', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should capture the target's current backdrop, render the node into an isolated content target, then composite them with the node's blend mode", () => {
    // mock
    const contentTarget = { tag: 'content-target' } as unknown as TRenderTarget;
    const backdrop = { tag: 'backdrop-target', texture: { tag: 'backdrop-texture' } } as unknown as TRenderTarget;
    const pool = { acquire: vi.fn(() => contentTarget), release: vi.fn() } as unknown as TMaskRenderer['pool'];
    const context = { tag: 'context' } as unknown as TMaskRenderer['context'];
    const renderer = { context, gl, pool, refs: createCanvasRefs() } as unknown as TMaskRenderer;
    const node = { blendMode: BlendMode.multiply, id: 'node-1', type: NodeType.rectangle } as unknown as TSceneNode;
    const target = { tag: 'outer-target' } as unknown as TRenderTarget;

    (captureBackdropTexture as unknown as ReturnType<typeof vi.fn>).mockReturnValue(backdrop);

    // action
    renderIsolatedBlendNode(renderer, node, target);

    // result — backdrop captured while target is bound, before the isolated content is drawn
    expect(bindTarget).toHaveBeenNthCalledWith(1, renderer, target);
    expect(captureBackdropTexture).toHaveBeenCalledWith(renderer, null);
    expect(renderIntoTarget).toHaveBeenCalledWith(renderer, contentTarget, expect.any(Function), null);
    expect(paintIsolatedContent).toHaveBeenCalledWith(renderer, node, contentTarget, null);
    expect(bindTarget).toHaveBeenNthCalledWith(2, renderer, target);
    expect(compositeBlend).toHaveBeenCalledWith(context, contentTarget.texture, backdrop.texture, BlendMode.multiply);
    expect(pool.release).toHaveBeenCalledWith(contentTarget);
    expect(pool.release).toHaveBeenCalledWith(backdrop);
  });

  it('should fall back to Normal when the node somehow has no blend mode of its own', () => {
    // mock
    const contentTarget = { tag: 'content-target' } as unknown as TRenderTarget;
    const backdrop = { texture: { tag: 'backdrop-texture' } } as unknown as TRenderTarget;
    const pool = { acquire: vi.fn(() => contentTarget), release: vi.fn() } as unknown as TMaskRenderer['pool'];
    const renderer = { context: {}, gl, pool, refs: createCanvasRefs() } as unknown as TMaskRenderer;
    const node = { id: 'node-1', type: NodeType.line } as unknown as TSceneNode;

    (captureBackdropTexture as unknown as ReturnType<typeof vi.fn>).mockReturnValue(backdrop);

    // action
    renderIsolatedBlendNode(renderer, node, null);

    // result
    expect(compositeBlend).toHaveBeenCalledWith(expect.anything(), contentTarget.texture, backdrop.texture, BlendMode.normal);
  });
});
