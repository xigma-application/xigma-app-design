// types
import { EffectType } from 'types/design/enums';
import { TMaskRenderer } from '../types';
import { TRenderTarget } from 'utils/canvas/renderTarget/createRenderTargetPool/types';
import { TSceneNode } from 'types/design/types';

// utils
import { blurIsolatedNode } from '../blurIsolatedNode';

const paramsMock = vi.fn();
const blurTargetMock = vi.fn();

vi.mock('../getNodeBlurParams', () => ({ getNodeBlurParams: (...args: unknown[]): unknown => paramsMock(...args) }));
vi.mock('../blurIsolatedTarget', () => ({ blurIsolatedTarget: (...args: unknown[]): unknown => blurTargetMock(...args) }));

const renderer = {} as TMaskRenderer;
const node = { id: 'n' } as TSceneNode;
const target = {} as TRenderTarget;

describe('blurIsolatedNode', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should blur the isolated content by the node layer blur', () => {
    // mock
    paramsMock.mockReturnValue({ progressive: 'progressive', radius: 4 });
    const rect = { height: 1, width: 1, x: 0, y: 0 };

    // before
    blurIsolatedNode(renderer, node, target, rect);

    // result
    expect(paramsMock).toHaveBeenCalledWith(renderer, node, EffectType.layerBlur);
    expect(blurTargetMock).toHaveBeenCalledWith(renderer, target, 4, 'progressive', rect);
  });

  it('should skip nodes without a positive layer blur, defaulting the rect to none', () => {
    // mock
    paramsMock.mockReturnValueOnce(null).mockReturnValueOnce({ progressive: null, radius: 0 });

    // before
    blurIsolatedNode(renderer, node, target);
    blurIsolatedNode(renderer, node, target);

    // result
    expect(blurTargetMock).not.toHaveBeenCalled();
  });
});
