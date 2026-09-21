// types
import { ExportColorProfile, ExportFormat, ExportImageResampling } from '../../enums';

// utils
import { createExportFile } from '../createExportFile';

const renderNodeForExportMock = vi.fn();
const createImageBlobFromPixelsMock = vi.fn();

vi.mock('utils/canvas/exportRender/exportRenderRegistry', () => ({
  renderNodeForExport: (...args: unknown[]): unknown => renderNodeForExportMock(...args),
}));
vi.mock('utils/canvas/createImageBlobFromPixels', () => ({
  createImageBlobFromPixels: (...args: unknown[]): unknown => createImageBlobFromPixelsMock(...args),
}));

describe('createExportFile', () => {
  beforeEach(() => {
    renderNodeForExportMock.mockClear();
    createImageBlobFromPixelsMock.mockClear();
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
    await createExportFile('node-a', ExportFormat.png, 1, 'Icon.png', true, ExportImageResampling.detailed, ExportColorProfile.displayP3);

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
});
