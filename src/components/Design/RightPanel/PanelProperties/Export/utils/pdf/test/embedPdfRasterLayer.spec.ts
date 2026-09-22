// types
import { ExportImageResampling } from '../../../enums';

// utils
import { embedPdfRasterLayer } from '../embedPdfRasterLayer';

const renderNodeForExportMock = vi.fn();
const createImageBlobFromPixelsMock = vi.fn();

vi.mock('utils/canvas/exportRender/exportRenderRegistry', () => ({
  renderNodeForExport: (...args: unknown[]): unknown => renderNodeForExportMock(...args),
}));
vi.mock('utils/canvas/createImageBlobFromPixels', () => ({
  createImageBlobFromPixels: (...args: unknown[]): unknown => createImageBlobFromPixelsMock(...args),
}));

const bounds = { height: 100, width: 100, x: 0, y: 0 };
const nodeIds = new Set(['a']);

describe('embedPdfRasterLayer', () => {
  beforeEach(() => {
    renderNodeForExportMock.mockReset();
    createImageBlobFromPixelsMock.mockReset();
  });

  it('should do nothing when the node could not be rendered', async () => {
    // mock
    renderNodeForExportMock.mockResolvedValue(null);
    const pdfDocument = { embedJpg: vi.fn(), embedPng: vi.fn() } as never;
    const page = { drawImage: vi.fn() } as never;

    // action
    await embedPdfRasterLayer(pdfDocument, page, 'n', 2, true, ExportImageResampling.basic, nodeIds, bounds, false, 0.92);

    // result
    expect(createImageBlobFromPixelsMock).not.toHaveBeenCalled();
    expect((page as { drawImage: ReturnType<typeof vi.fn> }).drawImage).not.toHaveBeenCalled();
  });

  it('should do nothing when the blob could not be created', async () => {
    // mock
    renderNodeForExportMock.mockResolvedValue({ height: 1, pixels: new Uint8Array(4), width: 1 });
    createImageBlobFromPixelsMock.mockResolvedValue(null);
    const pdfDocument = { embedJpg: vi.fn(), embedPng: vi.fn() } as never;
    const page = { drawImage: vi.fn() } as never;

    // action
    await embedPdfRasterLayer(pdfDocument, page, 'n', 2, true, ExportImageResampling.basic, nodeIds, bounds, false, 0.92);

    // result
    expect((pdfDocument as { embedPng: ReturnType<typeof vi.fn> }).embedPng).not.toHaveBeenCalled();
    expect((page as { drawImage: ReturnType<typeof vi.fn> }).drawImage).not.toHaveBeenCalled();
  });

  it('should embed a png with the raw pixels and draw it over the full bounds when useJpeg is false', async () => {
    // mock
    const pixels = new Uint8Array([1, 2, 3, 4]);

    renderNodeForExportMock.mockResolvedValue({ height: 10, pixels, width: 10 });
    createImageBlobFromPixelsMock.mockResolvedValue({ arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)) });

    const embedPng = vi.fn().mockResolvedValue('png-image');
    const drawImage = vi.fn();
    const pdfDocument = { embedJpg: vi.fn(), embedPng } as never;
    const page = { drawImage } as never;

    // action
    await embedPdfRasterLayer(pdfDocument, page, 'n', 2, true, ExportImageResampling.basic, nodeIds, bounds, false, 0.92);

    // result
    expect(createImageBlobFromPixelsMock).toHaveBeenCalledWith(pixels, 10, 10, 'image/png');
    expect(embedPng).toHaveBeenCalledTimes(1);
    expect(drawImage).toHaveBeenCalledWith('png-image', { height: 100, width: 100, x: 0, y: 0 });
  });

  it('should embed a jpeg with the pixels flattened to opaque white at the given quality when useJpeg is true', async () => {
    // mock
    const pixels = new Uint8Array([10, 20, 30, 0]);

    renderNodeForExportMock.mockResolvedValue({ height: 10, pixels, width: 10 });
    createImageBlobFromPixelsMock.mockResolvedValue({ arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)) });

    const embedJpg = vi.fn().mockResolvedValue('jpeg-image');
    const drawImage = vi.fn();
    const pdfDocument = { embedJpg, embedPng: vi.fn() } as never;
    const page = { drawImage } as never;

    // action
    await embedPdfRasterLayer(pdfDocument, page, 'n', 2, true, ExportImageResampling.basic, nodeIds, bounds, true, 0.5);

    // result
    expect(Array.from(createImageBlobFromPixelsMock.mock.calls[0][0] as Uint8Array)).toEqual([255, 255, 255, 255]);
    expect(createImageBlobFromPixelsMock).toHaveBeenCalledWith(expect.any(Uint8Array), 10, 10, 'image/jpeg', 0.5);
    expect(embedJpg).toHaveBeenCalledTimes(1);
    expect(drawImage).toHaveBeenCalledWith('jpeg-image', { height: 100, width: 100, x: 0, y: 0 });
  });
});
