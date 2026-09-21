// store
import { addNode, setSelection } from 'store/design/slice';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TCanvasRefs } from 'types/design/canvas/types';
import { TImageRenderContext } from '../../types';

// utils
import { createCanvasRefs } from '../../../useCanvasRefs/createCanvasRefs';
import { resolveExportRenderRequest } from '../resolveExportRenderRequest';

const renderNodeAtScaleMock = vi.fn();
const getExportRenderNodesMock = vi.fn();

vi.mock('../drawScene/renderNodeAtScale', () => ({
  renderNodeAtScale: (...args: unknown[]): unknown => renderNodeAtScaleMock(...args),
}));
vi.mock('../drawScene/getExportRenderNodes', () => ({
  getExportRenderNodes: (...args: unknown[]): unknown => getExportRenderNodesMock(...args),
}));

const gl = {} as WebGL2RenderingContext;
const program = {} as WebGLProgram;
const buffer = {} as WebGLBuffer;
const imageContext = {} as TImageRenderContext;

describe('resolveExportRenderRequest', () => {
  let refs: TCanvasRefs;

  beforeEach(() => {
    store.dispatch(setSelection([]));
    refs = createCanvasRefs();
    renderNodeAtScaleMock.mockClear();
    getExportRenderNodesMock.mockClear();
  });

  it('should do nothing when no export render request is pending', () => {
    // action
    resolveExportRenderRequest(gl, program, buffer, imageContext, refs);

    // result
    expect(renderNodeAtScaleMock).not.toHaveBeenCalled();
    expect(getExportRenderNodesMock).not.toHaveBeenCalled();
  });

  it('should resolve the pending request with the rendered pixels and clear it', () => {
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
    const pixels = { height: 40, pixels: new Uint8Array(4), width: 40 };
    const nodesToDraw = [{ id: 'r1' }];

    refs.exportRenderRequestRef.current = {
      ignoreOverlappingLayers: true,
      imageFilterQuality: 'detailed',
      nodeId: 'r1',
      onResolve,
      scale: 2,
    };
    getExportRenderNodesMock.mockReturnValue(nodesToDraw);
    renderNodeAtScaleMock.mockReturnValue(pixels);

    // before
    resolveExportRenderRequest(gl, program, buffer, imageContext, refs);

    // result
    expect(getExportRenderNodesMock).toHaveBeenCalledWith('r1', expect.any(Object), expect.any(Array), true);
    expect(renderNodeAtScaleMock).toHaveBeenCalledWith(
      {
        buffer,
        canvasHeight: 0,
        canvasWidth: 0,
        gl,
        imageContext,
        imageFilterQuality: 'detailed',
        program,
        viewport: { x: 0, y: 0, zoom: 1 },
      },
      'r1',
      nodesToDraw,
      expect.any(Object),
      refs,
      2,
    );
    expect(onResolve).toHaveBeenCalledWith(pixels);
    expect(refs.exportRenderRequestRef.current).toBeNull();
  });

  it('should resolve with null when the node could not be rendered', () => {
    // mock
    const onResolve = vi.fn();

    refs.exportRenderRequestRef.current = {
      ignoreOverlappingLayers: false,
      imageFilterQuality: 'basic',
      nodeId: 'missing',
      onResolve,
      scale: 2,
    };
    getExportRenderNodesMock.mockReturnValue([]);
    renderNodeAtScaleMock.mockReturnValue(null);

    // before
    resolveExportRenderRequest(gl, program, buffer, imageContext, refs);

    // result
    expect(getExportRenderNodesMock).toHaveBeenCalledWith('missing', expect.any(Object), expect.any(Array), false);
    expect(onResolve).toHaveBeenCalledWith(null);
  });

  it('should draw only the nodes listed in includeNodeIds when the request narrows the render', () => {
    // mock
    const onResolve = vi.fn();

    refs.exportRenderRequestRef.current = {
      ignoreOverlappingLayers: true,
      imageFilterQuality: 'basic',
      includeNodeIds: new Set(['b']),
      nodeId: 'a',
      onResolve,
      scale: 1,
    };
    getExportRenderNodesMock.mockReturnValue([{ id: 'a' }, { id: 'b' }, { id: 'c' }]);
    renderNodeAtScaleMock.mockReturnValue(null);

    // before
    resolveExportRenderRequest(gl, program, buffer, imageContext, refs);

    // result
    expect(renderNodeAtScaleMock).toHaveBeenCalledWith(expect.any(Object), 'a', [{ id: 'b' }], expect.any(Object), refs, 1);
  });
});
