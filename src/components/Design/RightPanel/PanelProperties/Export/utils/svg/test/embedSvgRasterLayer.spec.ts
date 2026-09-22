// types
import { ExportImageResampling } from '../../../enums';

// utils
import { embedSvgRasterLayer } from '../embedSvgRasterLayer';

const renderNodeForExportMock = vi.fn();
const createImageBlobFromPixelsMock = vi.fn();
const blobToDataUrlMock = vi.fn();

vi.mock('utils/canvas/exportRender/exportRenderRegistry', () => ({
  renderNodeForExport: (...args: unknown[]): unknown => renderNodeForExportMock(...args),
}));
vi.mock('utils/canvas/createImageBlobFromPixels', () => ({
  createImageBlobFromPixels: (...args: unknown[]): unknown => createImageBlobFromPixelsMock(...args),
}));
vi.mock('utils/blobToDataUrl', () => ({ blobToDataUrl: (...args: unknown[]): unknown => blobToDataUrlMock(...args) }));

const bounds = { height: 100, width: 100, x: 0, y: 0 };
const nodeIds = new Set(['a']);

describe('embedSvgRasterLayer', () => {
  beforeEach(() => {
    renderNodeForExportMock.mockReset();
    createImageBlobFromPixelsMock.mockReset();
    blobToDataUrlMock.mockReset();
  });

  it('should push nothing when the node could not be rendered', async () => {
    renderNodeForExportMock.mockResolvedValue(null);
    const elements: string[] = [];

    await embedSvgRasterLayer(elements, 'n', 2, true, ExportImageResampling.basic, nodeIds, bounds, false, 0.92);

    expect(createImageBlobFromPixelsMock).not.toHaveBeenCalled();
    expect(elements).toEqual([]);
  });

  it('should push nothing when the blob could not be created', async () => {
    renderNodeForExportMock.mockResolvedValue({ height: 1, pixels: new Uint8Array(4), width: 1 });
    createImageBlobFromPixelsMock.mockResolvedValue(null);
    const elements: string[] = [];

    await embedSvgRasterLayer(elements, 'n', 2, true, ExportImageResampling.basic, nodeIds, bounds, false, 0.92);

    expect(blobToDataUrlMock).not.toHaveBeenCalled();
    expect(elements).toEqual([]);
  });

  it('should embed a png with the raw pixels as an image element over the full bounds when useJpeg is false', async () => {
    const pixels = new Uint8Array([1, 2, 3, 4]);

    renderNodeForExportMock.mockResolvedValue({ height: 10, pixels, width: 10 });
    createImageBlobFromPixelsMock.mockResolvedValue('png-blob');
    blobToDataUrlMock.mockResolvedValue('data:image/png;base64,AAAA');

    const elements: string[] = [];

    await embedSvgRasterLayer(elements, 'n', 2, true, ExportImageResampling.basic, nodeIds, bounds, false, 0.92);

    expect(createImageBlobFromPixelsMock).toHaveBeenCalledWith(pixels, 10, 10, 'image/png');
    expect(elements).toEqual(['<image href="data:image/png;base64,AAAA" x="0" y="0" width="100" height="100"/>']);
  });

  it('should embed a jpeg with the pixels flattened to opaque white at the given quality when useJpeg is true', async () => {
    const pixels = new Uint8Array([10, 20, 30, 0]);

    renderNodeForExportMock.mockResolvedValue({ height: 10, pixels, width: 10 });
    createImageBlobFromPixelsMock.mockResolvedValue('jpeg-blob');
    blobToDataUrlMock.mockResolvedValue('data:image/jpeg;base64,BBBB');

    const elements: string[] = [];

    await embedSvgRasterLayer(elements, 'n', 2, true, ExportImageResampling.basic, nodeIds, bounds, true, 0.5);

    expect(Array.from(createImageBlobFromPixelsMock.mock.calls[0][0] as Uint8Array)).toEqual([255, 255, 255, 255]);
    expect(createImageBlobFromPixelsMock).toHaveBeenCalledWith(expect.any(Uint8Array), 10, 10, 'image/jpeg', 0.5);
    expect(elements).toEqual(['<image href="data:image/jpeg;base64,BBBB" x="0" y="0" width="100" height="100"/>']);
  });
});
