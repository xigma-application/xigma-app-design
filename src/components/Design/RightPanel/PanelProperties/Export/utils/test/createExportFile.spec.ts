// types
import { ExportColorProfile, ExportFormat, ExportImageResampling, ExportQuality } from '../../enums';

// utils
import { createExportFile } from '../createExportFile';

const renderNodeForExportMock = vi.fn();
const createImageBlobFromPixelsMock = vi.fn();
const createPdfBlobMock = vi.fn();

vi.mock('utils/canvas/exportRender/exportRenderRegistry', () => ({
  renderNodeForExport: (...args: unknown[]): unknown => renderNodeForExportMock(...args),
}));
vi.mock('utils/canvas/createImageBlobFromPixels', () => ({
  createImageBlobFromPixels: (...args: unknown[]): unknown => createImageBlobFromPixelsMock(...args),
}));

vi.mock('../pdf/createPdfBlob', () => ({ createPdfBlob: (...args: unknown[]): unknown => createPdfBlobMock(...args) }));

describe('createExportFile', () => {
  beforeEach(() => {
    renderNodeForExportMock.mockClear();
    createImageBlobFromPixelsMock.mockClear();
    createPdfBlobMock.mockClear();
  });

  it('should build a pdf with at least the minimum raster scale and skip the pixel pipeline', async () => {
    // mock
    const blob = { size: 4, type: 'application/pdf' } as Blob;

    createPdfBlobMock.mockResolvedValue(blob);

    // action
    const result = await createExportFile(
      'node-a',
      ExportFormat.pdf,
      1,
      'Icon.pdf',
      true,
      ExportImageResampling.detailed,
      ExportColorProfile.srgb,
      ExportQuality.high,
    );

    // result
    expect(createPdfBlobMock).toHaveBeenCalledWith('node-a', 2, true, ExportImageResampling.detailed);
    expect(renderNodeForExportMock).not.toHaveBeenCalled();
    expect(result).toEqual({ blob, fileName: 'Icon.pdf' });
  });

  it('should keep a larger export scale for the pdf raster layers', async () => {
    // mock
    createPdfBlobMock.mockResolvedValue({ size: 4, type: 'application/pdf' } as Blob);

    // action
    await createExportFile(
      'node-a',
      ExportFormat.pdf,
      4,
      'Icon.pdf',
      false,
      ExportImageResampling.basic,
      ExportColorProfile.srgb,
      ExportQuality.high,
    );

    // result
    expect(createPdfBlobMock).toHaveBeenCalledWith('node-a', 4, false, ExportImageResampling.basic);
  });

  it('should return null when the pdf could not be built', async () => {
    // mock
    createPdfBlobMock.mockResolvedValue(null);

    // action
    const result = await createExportFile(
      'node-a',
      ExportFormat.pdf,
      1,
      'Icon.pdf',
      true,
      ExportImageResampling.detailed,
      ExportColorProfile.srgb,
      ExportQuality.high,
    );

    // result
    expect(result).toBeNull();
  });

  it('should return null when the node could not be rendered', async () => {
    // mock
    renderNodeForExportMock.mockResolvedValue(null);

    // action
    const result = await createExportFile(
      'node-a',
      ExportFormat.png,
      2,
      'Icon.png',
      true,
      ExportImageResampling.detailed,
      ExportColorProfile.srgb,
      ExportQuality.high,
    );

    // result
    expect(result).toBeNull();
    expect(createImageBlobFromPixelsMock).not.toHaveBeenCalled();
  });

  it('should return null when the render succeeded but the blob could not be created', async () => {
    // mock
    renderNodeForExportMock.mockResolvedValue({ height: 10, pixels: new Uint8Array(4), width: 10 });
    createImageBlobFromPixelsMock.mockResolvedValue(null);

    // action
    const result = await createExportFile(
      'node-a',
      ExportFormat.png,
      2,
      'Icon.png',
      true,
      ExportImageResampling.detailed,
      ExportColorProfile.srgb,
      ExportQuality.high,
    );

    // result
    expect(result).toBeNull();
  });

  it('should render at the given scale and encode a png without a quality argument, using the target sRGB profile', async () => {
    // mock
    const pixels = { height: 10, pixels: new Uint8Array(4), width: 10 };
    const blob = { size: 4, type: 'image/png' } as Blob;

    renderNodeForExportMock.mockResolvedValue(pixels);
    createImageBlobFromPixelsMock.mockResolvedValue(blob);

    // action
    const result = await createExportFile(
      'node-a',
      ExportFormat.png,
      2,
      'Icon.png',
      true,
      ExportImageResampling.detailed,
      ExportColorProfile.srgb,
      ExportQuality.high,
    );

    // result
    expect(renderNodeForExportMock).toHaveBeenCalledWith('node-a', 2, true, ExportImageResampling.detailed);
    expect(createImageBlobFromPixelsMock).toHaveBeenCalledWith(pixels.pixels, pixels.width, pixels.height, 'image/png', undefined, 'srgb');
    expect(result).toEqual({ blob, fileName: 'Icon.png' });
  });

  it('should encode a jpeg with the fixed export quality', async () => {
    // mock
    const pixels = { height: 10, pixels: new Uint8Array(4), width: 10 };
    const blob = { size: 4, type: 'image/jpeg' } as Blob;

    renderNodeForExportMock.mockResolvedValue(pixels);
    createImageBlobFromPixelsMock.mockResolvedValue(blob);

    // action
    const result = await createExportFile(
      'node-a',
      ExportFormat.jpeg,
      1,
      'Icon.jpg',
      false,
      ExportImageResampling.basic,
      ExportColorProfile.srgb,
      ExportQuality.high,
    );

    // result
    expect(renderNodeForExportMock).toHaveBeenCalledWith('node-a', 1, false, ExportImageResampling.basic);
    expect(createImageBlobFromPixelsMock).toHaveBeenCalledWith(pixels.pixels, pixels.width, pixels.height, 'image/jpeg', 0.92, 'srgb');
    expect(result).toEqual({ blob, fileName: 'Icon.jpg' });
  });

  it('should map srgbSameAsFile to the srgb target too, since this app has no document-level color space to match', async () => {
    // mock
    const pixels = { height: 10, pixels: new Uint8Array(4), width: 10 };
    const blob = { size: 4, type: 'image/png' } as Blob;

    renderNodeForExportMock.mockResolvedValue(pixels);
    createImageBlobFromPixelsMock.mockResolvedValue(blob);

    // action
    await createExportFile(
      'node-a',
      ExportFormat.png,
      1,
      'Icon.png',
      true,
      ExportImageResampling.detailed,
      ExportColorProfile.srgbSameAsFile,
      ExportQuality.high,
    );

    // result
    expect(renderNodeForExportMock).toHaveBeenCalledWith('node-a', 1, true, ExportImageResampling.detailed);
  });

  it('should render and encode using the Display P3 target when that color profile is requested', async () => {
    // mock
    const pixels = { height: 10, pixels: new Uint8Array(4), width: 10 };
    const blob = { size: 4, type: 'image/png' } as Blob;

    renderNodeForExportMock.mockResolvedValue(pixels);
    createImageBlobFromPixelsMock.mockResolvedValue(blob);

    // action
    await createExportFile(
      'node-a',
      ExportFormat.png,
      1,
      'Icon.png',
      true,
      ExportImageResampling.detailed,
      ExportColorProfile.displayP3,
      ExportQuality.high,
    );

    // result
    expect(renderNodeForExportMock).toHaveBeenCalledWith('node-a', 1, true, ExportImageResampling.detailed);
    expect(createImageBlobFromPixelsMock).toHaveBeenCalledWith(
      pixels.pixels,
      pixels.width,
      pixels.height,
      'image/png',
      undefined,
      'displayP3',
    );
  });

  it('should map the chosen quality to the jpeg encoder quality', async () => {
    // mock
    const pixels = { height: 10, pixels: new Uint8Array(4), width: 10 };

    renderNodeForExportMock.mockResolvedValue(pixels);
    createImageBlobFromPixelsMock.mockResolvedValue({ size: 4, type: 'image/jpeg' } as Blob);

    // action
    await createExportFile(
      'node-a',
      ExportFormat.jpeg,
      1,
      'Icon.jpg',
      true,
      ExportImageResampling.basic,
      ExportColorProfile.srgb,
      ExportQuality.medium,
    );
    await createExportFile(
      'node-a',
      ExportFormat.jpeg,
      1,
      'Icon.jpg',
      true,
      ExportImageResampling.basic,
      ExportColorProfile.srgb,
      ExportQuality.low,
    );

    // result
    expect(createImageBlobFromPixelsMock.mock.calls[0][4]).toBe(0.75);
    expect(createImageBlobFromPixelsMock.mock.calls[1][4]).toBe(0.5);
  });
});
