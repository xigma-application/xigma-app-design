// types
import { NodeType } from 'types/design/enums';
import { TMaskRenderer } from '../types';
import { TRenderTarget } from 'utils/canvas/renderTarget/createRenderTargetPool/types';
import { TSceneNode } from 'types/design/types';

// utils
import { canRenderGlassDirectly } from '../canRenderGlassDirectly';

const zoomChangingMock = vi.fn();

vi.mock('../isBlurZoomChanging', () => ({ isBlurZoomChanging: (...args: unknown[]): unknown => zoomChangingMock(...args) }));

const renderer = { context: { viewport: { zoom: 2 } }, gl: {} } as unknown as TMaskRenderer;
const rect = { height: 1, width: 1, x: 0, y: 0 };
const node = (type: NodeType): TSceneNode => ({ type }) as TSceneNode;

describe('canRenderGlassDirectly', () => {
  it('should render a rectangle or frame straight to the canvas while the zoom is changing', () => {
    // mock
    zoomChangingMock.mockReturnValue(true);

    // result
    expect(canRenderGlassDirectly(renderer, node(NodeType.rectangle), null, rect)).toBe(true);
    expect(canRenderGlassDirectly(renderer, node(NodeType.frame), null, rect)).toBe(true);
    expect(zoomChangingMock).toHaveBeenCalledWith(renderer.gl, 2, expect.any(Number));
  });

  it('should not when rendering into a target, without a rect, for other shapes or at a steady zoom', () => {
    // mock
    zoomChangingMock.mockReturnValue(false);

    // result
    expect(canRenderGlassDirectly(renderer, node(NodeType.rectangle), {} as TRenderTarget, rect)).toBe(false);
    expect(canRenderGlassDirectly(renderer, node(NodeType.rectangle), null, null)).toBe(false);
    expect(canRenderGlassDirectly(renderer, node(NodeType.ellipse), null, rect)).toBe(false);
    expect(canRenderGlassDirectly(renderer, node(NodeType.rectangle), null, rect)).toBe(false);
  });
});
