// store
import { addNode, setSelection } from 'store/design/slice';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TCanvasRefs } from 'types/design/canvas/types';
import { TImageRenderContext } from '../../types';

// utils
import { createCanvasRefs } from '../../../useCanvasRefs/createCanvasRefs';
import { resolvePatternThumbnailRequest } from '../resolvePatternThumbnailRequest';

const renderPatternSourceThumbnailMock = vi.fn();
const createImageDataUrlFromPixelsMock = vi.fn();

vi.mock('../drawScene/renderPatternSourceThumbnail', () => ({
  renderPatternSourceThumbnail: (...args: unknown[]): unknown => renderPatternSourceThumbnailMock(...args),
}));
vi.mock('utils/canvas/createImageDataUrlFromPixels', () => ({
  createImageDataUrlFromPixels: (...args: unknown[]): unknown => createImageDataUrlFromPixelsMock(...args),
}));

const gl = {} as WebGL2RenderingContext;
const program = {} as WebGLProgram;
const buffer = {} as WebGLBuffer;
const imageContext = {} as TImageRenderContext;

describe('resolvePatternThumbnailRequest', () => {
  let refs: TCanvasRefs;

  beforeEach(() => {
    store.dispatch(setSelection([]));
    refs = createCanvasRefs();
    renderPatternSourceThumbnailMock.mockClear();
    createImageDataUrlFromPixelsMock.mockClear();
  });

  it('should do nothing when no thumbnail request is pending', () => {
    // action
    resolvePatternThumbnailRequest(gl, program, buffer, imageContext, refs);

    // result
    expect(renderPatternSourceThumbnailMock).not.toHaveBeenCalled();
  });

  it('should resolve the pending request with the created data URL and clear it', () => {
    // mock
    store.dispatch(
      addNode({
        fills: [{ color: '#ff0000', opacity: 100, type: 'solid' }],
        height: 20,
        name: 'Rectangle',
        parentId: null,
        rotation: 0,
        type: NodeType.rectangle,
        width: 20,
        x: 0,
        y: 0,
      }),
    );

    const onResolve = vi.fn();

    refs.patternThumbnailRequestRef.current = { onResolve, size: 256, sourceNodeId: 'r1' };
    renderPatternSourceThumbnailMock.mockReturnValue({ height: 128, pixels: new Uint8Array(4), width: 256 });
    createImageDataUrlFromPixelsMock.mockReturnValue('data:image/png;base64,abc');

    // before
    resolvePatternThumbnailRequest(gl, program, buffer, imageContext, refs);

    // result
    expect(renderPatternSourceThumbnailMock).toHaveBeenCalledWith(
      { buffer, canvasHeight: 256, canvasWidth: 256, gl, imageContext, program, viewport: { x: 0, y: 0, zoom: 1 } },
      'r1',
      expect.any(Object),
      refs,
      256,
      expect.any(Array),
      expect.any(Array),
    );
    expect(createImageDataUrlFromPixelsMock).toHaveBeenCalledWith(expect.any(Uint8Array), 256, 128);
    expect(onResolve).toHaveBeenCalledWith('data:image/png;base64,abc');
    expect(refs.patternThumbnailRequestRef.current).toBeNull();
  });

  it('should resolve with null, without creating a data URL, when the thumbnail could not be rendered', () => {
    // mock
    const onResolve = vi.fn();

    refs.patternThumbnailRequestRef.current = { onResolve, size: 256, sourceNodeId: 'missing' };
    renderPatternSourceThumbnailMock.mockReturnValue(null);

    // before
    resolvePatternThumbnailRequest(gl, program, buffer, imageContext, refs);

    // result
    expect(createImageDataUrlFromPixelsMock).not.toHaveBeenCalled();
    expect(onResolve).toHaveBeenCalledWith(null);
  });
});
