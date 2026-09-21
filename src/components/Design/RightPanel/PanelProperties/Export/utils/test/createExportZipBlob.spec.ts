// utils
import { createExportZipBlob } from '../createExportZipBlob';

const fileMock = vi.fn();
const generateAsyncMock = vi.fn();

vi.mock('jszip', () => ({
  default: vi.fn().mockImplementation(function MockJSZip() {
    return { file: fileMock, generateAsync: generateAsyncMock };
  }),
}));

describe('createExportZipBlob', () => {
  beforeEach(() => {
    fileMock.mockClear();
    generateAsyncMock.mockClear();
  });

  it('should add every file to the archive by its own name and generate a blob', async () => {
    // mock
    const zipBlob = { size: 100, type: 'application/zip' } as Blob;
    const firstBlob = { size: 4, type: 'image/png' } as Blob;
    const secondBlob = { size: 4, type: 'image/jpeg' } as Blob;

    generateAsyncMock.mockResolvedValue(zipBlob);

    // action
    const result = await createExportZipBlob([
      { blob: firstBlob, fileName: 'Icon.png' },
      { blob: secondBlob, fileName: 'Icon.jpg' },
    ]);

    // result
    expect(fileMock).toHaveBeenNthCalledWith(1, 'Icon.png', firstBlob);
    expect(fileMock).toHaveBeenNthCalledWith(2, 'Icon.jpg', secondBlob);
    expect(generateAsyncMock).toHaveBeenCalledWith({ type: 'blob' });
    expect(result).toBe(zipBlob);
  });
});
