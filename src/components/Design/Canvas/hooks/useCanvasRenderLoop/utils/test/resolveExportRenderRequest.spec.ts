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
const renderNodeSubtreeAtScaleMock = vi.fn();
const getExportRenderNodesMock = vi.fn();

vi.mock('../drawScene/renderExport/renderNodeAtScale', () => ({
  renderNodeAtScale: (...args: unknown[]): unknown => renderNodeAtScaleMock(...args),
}));
vi.mock('../drawScene/renderExport/renderNodeSubtreeAtScale', () => ({
  renderNodeSubtreeAtScale: (...args: unknown[]): unknown => renderNodeSubtreeAtScaleMock(...args),
}));
vi.mock('../drawScene/getExportRenderNodes', () => ({
  getExportRenderNodes: (...args: unknown[]): unknown => getExportRenderNodesMock(...args),
}));

const gl = {} as WebGL2RenderingContext;
const program = {} as WebGLProgram;
const buffer = {} as WebGLBuffer;
const imageContext = {} as TImageRenderContext;
const EXPECTED_CONTEXT = {
  buffer,
  canvasHeight: 0,
  canvasWidth: 0,
  gl,
  imageContext,
  imageFilterQuality: 'detailed',
  program,
  viewport: { x: 0, y: 0, zoom: 1 },
};

describe('resolveExportRenderRequest', () => {
  let refs: TCanvasRefs;

  beforeEach(() => {
    store.dispatch(setSelection([]));
    refs = createCanvasRefs();
    renderNodeAtScaleMock.mockClear();
    renderNodeSubtreeAtScaleMock.mockClear();
    getExportRenderNodesMock.mockClear();
  });

  it('should do nothing when no export render request is pending', () => {
    // action
    resolveExportRenderRequest(gl, program, buffer, imageContext, refs);

    // result
    expect(renderNodeAtScaleMock).not.toHaveBeenCalled();
    expect(renderNodeSubtreeAtScaleMock).not.toHaveBeenCalled();
    expect(getExportRenderNodesMock).not.toHaveBeenCalled();
  });

  it('should render through the effect-aware subtree renderer for the default request (ignoreOverlappingLayers on, no includeNodeIds), without flattening the render list', () => {
    // mock — "Ignore overlapping layers" defaults to true, so this is the common real-world request shape
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

    refs.exportRenderRequestRef.current = {
      ignoreOverlappingLayers: true,
      imageFilterQuality: 'detailed',
      nodeId: 'r1',
      onResolve,
      scale: 2,
    };
    renderNodeSubtreeAtScaleMock.mockReturnValue(pixels);

    // before
    resolveExportRenderRequest(gl, program, buffer, imageContext, refs);

    // result
    expect(getExportRenderNodesMock).not.toHaveBeenCalled();
    expect(renderNodeAtScaleMock).not.toHaveBeenCalled();
    expect(renderNodeSubtreeAtScaleMock).toHaveBeenCalledWith(EXPECTED_CONTEXT, 'r1', expect.any(Object), refs, 2, undefined);
    expect(onResolve).toHaveBeenCalledWith(pixels);
    expect(refs.exportRenderRequestRef.current).toBeNull();
  });

  it('should forward the request own bounds override to the subtree renderer', () => {
    // mock
    const onResolve = vi.fn();
    const boundsOverride = { height: 10, width: 10, x: 5, y: 5 };

    refs.exportRenderRequestRef.current = {
      boundsOverride,
      ignoreOverlappingLayers: true,
      imageFilterQuality: 'basic',
      nodeId: 'missing',
      onResolve,
      scale: 2,
    };
    renderNodeSubtreeAtScaleMock.mockReturnValue(null);

    // before
    resolveExportRenderRequest(gl, program, buffer, imageContext, refs);

    // result
    expect(renderNodeSubtreeAtScaleMock).toHaveBeenCalledWith(expect.any(Object), 'missing', expect.any(Object), refs, 2, boundsOverride);
    expect(onResolve).toHaveBeenCalledWith(null);
  });

  it('should fall back to the flat renderer when ignoreOverlappingLayers is off (the whole document own real z-order is needed, not just one subtree)', () => {
    // mock
    const onResolve = vi.fn();
    const nodesToDraw = [{ id: 'r1' }];

    refs.exportRenderRequestRef.current = {
      ignoreOverlappingLayers: false,
      imageFilterQuality: 'detailed',
      nodeId: 'r1',
      onResolve,
      scale: 2,
    };
    getExportRenderNodesMock.mockReturnValue(nodesToDraw);
    renderNodeAtScaleMock.mockReturnValue(null);

    // before
    resolveExportRenderRequest(gl, program, buffer, imageContext, refs);

    // result
    expect(getExportRenderNodesMock).toHaveBeenCalledWith('r1', expect.any(Object), expect.any(Array), false);
    expect(renderNodeSubtreeAtScaleMock).not.toHaveBeenCalled();
    expect(renderNodeAtScaleMock).toHaveBeenCalledWith(EXPECTED_CONTEXT, 'r1', nodesToDraw, expect.any(Object), refs, 2, undefined);
    expect(onResolve).toHaveBeenCalledWith(null);
  });

  it('should draw only the nodes listed in includeNodeIds, via the flat renderer, even with the default ignoreOverlappingLayers: true', () => {
    // mock — includeNodeIds is an arbitrary cross-subtree subset (e.g. a raster-layer run of several
    // merged, not-necessarily-related nodes), so it can never reduce to a single subtree walk
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
    expect(getExportRenderNodesMock).toHaveBeenCalledWith('a', expect.any(Object), expect.any(Array), true);
    expect(renderNodeSubtreeAtScaleMock).not.toHaveBeenCalled();
    expect(renderNodeAtScaleMock).toHaveBeenCalledWith(expect.any(Object), 'a', [{ id: 'b' }], expect.any(Object), refs, 1, undefined);
  });

  it('should forward the request own bounds override to the flat renderer', () => {
    // mock
    const onResolve = vi.fn();
    const boundsOverride = { height: 10, width: 10, x: 5, y: 5 };

    refs.exportRenderRequestRef.current = {
      boundsOverride,
      ignoreOverlappingLayers: false,
      imageFilterQuality: 'basic',
      nodeId: 'a',
      onResolve,
      scale: 1,
    };
    getExportRenderNodesMock.mockReturnValue([]);
    renderNodeAtScaleMock.mockReturnValue(null);

    // before
    resolveExportRenderRequest(gl, program, buffer, imageContext, refs);

    // result
    expect(renderNodeAtScaleMock).toHaveBeenCalledWith(expect.any(Object), 'a', [], expect.any(Object), refs, 1, boundsOverride);
  });
});
