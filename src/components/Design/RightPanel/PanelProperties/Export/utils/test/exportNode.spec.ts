// others
import { DEFAULT_EXPORT_SETTING } from '../../constants';

// types
import { ExportColorProfile, ExportFormat, ExportImageResampling } from '../../enums';
import { TExportSetting } from '../../types';

// utils
import { exportNode } from '../exportNode';

const createExportFileMock = vi.fn();
const createExportZipBlobMock = vi.fn();
const downloadBlobMock = vi.fn();

vi.mock('../createExportFile', () => ({ createExportFile: (...args: unknown[]): unknown => createExportFileMock(...args) }));
vi.mock('../createExportZipBlob', () => ({ createExportZipBlob: (...args: unknown[]): unknown => createExportZipBlobMock(...args) }));
vi.mock('utils/downloadBlob', () => ({ downloadBlob: (...args: unknown[]): void => downloadBlobMock(...args) }));

const setting = (overrides: Partial<TExportSetting> = {}): TExportSetting => ({ ...DEFAULT_EXPORT_SETTING, ...overrides });
const bounds = { height: 100, width: 100, x: 0, y: 0 };

describe('exportNode', () => {
  beforeEach(() => {
    createExportFileMock.mockClear();
    createExportZipBlobMock.mockClear();
    downloadBlobMock.mockClear();
  });

  it('should skip unsupported (svg) rows entirely', async () => {
    // action
    await exportNode('node-a', 'Icon', bounds, [setting({ format: ExportFormat.svg })]);

    // result
    expect(createExportFileMock).not.toHaveBeenCalled();
    expect(downloadBlobMock).not.toHaveBeenCalled();
  });

  it('should download a single rendered file directly, without zipping', async () => {
    // mock
    const file = { blob: { size: 4, type: 'image/png' } as Blob, fileName: 'Icon.png' };

    createExportFileMock.mockResolvedValue(file);

    // action
    await exportNode('node-a', 'Icon', bounds, [setting({ format: ExportFormat.png })]);

    // result
    expect(createExportFileMock).toHaveBeenCalledWith(
      'node-a',
      ExportFormat.png,
      1,
      'Icon.png',
      true,
      DEFAULT_EXPORT_SETTING.imageResampling,
      DEFAULT_EXPORT_SETTING.colorProfile,
    );
    expect(createExportZipBlobMock).not.toHaveBeenCalled();
    expect(downloadBlobMock).toHaveBeenCalledWith(file.blob, 'Icon.png');
  });

  it('should forward each row own ignoreOverlappingLayers setting', async () => {
    // mock
    const file = { blob: { size: 4, type: 'image/png' } as Blob, fileName: 'Icon.png' };

    createExportFileMock.mockResolvedValue(file);

    // action
    await exportNode('node-a', 'Icon', bounds, [setting({ format: ExportFormat.png, ignoreOverlappingLayers: false })]);

    // result
    expect(createExportFileMock).toHaveBeenCalledWith(
      'node-a',
      ExportFormat.png,
      1,
      'Icon.png',
      false,
      DEFAULT_EXPORT_SETTING.imageResampling,
      DEFAULT_EXPORT_SETTING.colorProfile,
    );
  });

  it('should forward each row own imageResampling setting', async () => {
    // mock
    const file = { blob: { size: 4, type: 'image/png' } as Blob, fileName: 'Icon.png' };

    createExportFileMock.mockResolvedValue(file);

    // action
    await exportNode('node-a', 'Icon', bounds, [setting({ format: ExportFormat.png, imageResampling: ExportImageResampling.basic })]);

    // result
    expect(createExportFileMock).toHaveBeenCalledWith(
      'node-a',
      ExportFormat.png,
      1,
      'Icon.png',
      true,
      ExportImageResampling.basic,
      DEFAULT_EXPORT_SETTING.colorProfile,
    );
  });

  it('should forward each row own colorProfile setting', async () => {
    // mock
    const file = { blob: { size: 4, type: 'image/png' } as Blob, fileName: 'Icon.png' };

    createExportFileMock.mockResolvedValue(file);

    // action
    await exportNode('node-a', 'Icon', bounds, [setting({ colorProfile: ExportColorProfile.displayP3, format: ExportFormat.png })]);

    // result
    expect(createExportFileMock).toHaveBeenCalledWith(
      'node-a',
      ExportFormat.png,
      1,
      'Icon.png',
      true,
      DEFAULT_EXPORT_SETTING.imageResampling,
      ExportColorProfile.displayP3,
    );
  });

  it('should render rows one at a time, not concurrently, since the export-render request is a single slot rather than a queue', async () => {
    // mock — the second row's render must not start until the first row's promise has resolved
    let resolveFirst: (file: { blob: Blob; fileName: string } | null) => void = () => {};
    const firstFilePromise = new Promise<{ blob: Blob; fileName: string } | null>((resolve) => {
      resolveFirst = resolve;
    });
    const secondFile = { blob: { size: 4, type: 'image/jpeg' } as Blob, fileName: 'Icon.jpg' };

    createExportFileMock.mockReturnValueOnce(firstFilePromise).mockResolvedValueOnce(secondFile);

    // action
    const exportPromise = exportNode('node-a', 'Icon', bounds, [
      setting({ format: ExportFormat.png }),
      setting({ format: ExportFormat.jpeg }),
    ]);

    // result — only the first row's render has been requested so far
    expect(createExportFileMock).toHaveBeenCalledTimes(1);

    // action
    resolveFirst({ blob: { size: 4, type: 'image/png' } as Blob, fileName: 'Icon.png' });
    await exportPromise;

    // result — the second row's render only started after the first one resolved
    expect(createExportFileMock).toHaveBeenCalledTimes(2);
  });

  it('should zip and download multiple rendered files as one archive named after the node', async () => {
    // mock
    const firstFile = { blob: { size: 4, type: 'image/png' } as Blob, fileName: 'Icon.png' };
    const secondFile = { blob: { size: 4, type: 'image/jpeg' } as Blob, fileName: 'Icon.jpg' };
    const zipBlob = { size: 100, type: 'application/zip' } as Blob;

    createExportFileMock.mockResolvedValueOnce(firstFile).mockResolvedValueOnce(secondFile);
    createExportZipBlobMock.mockResolvedValue(zipBlob);

    // action
    await exportNode('node-a', 'Icon', bounds, [setting({ format: ExportFormat.png }), setting({ format: ExportFormat.jpeg })]);

    // result
    expect(createExportZipBlobMock).toHaveBeenCalledWith([firstFile, secondFile]);
    expect(downloadBlobMock).toHaveBeenCalledWith(zipBlob, 'Icon.zip');
  });

  it('should drop rows that failed to render and still download whatever succeeded', async () => {
    // mock
    const file = { blob: { size: 4, type: 'image/png' } as Blob, fileName: 'Icon.png' };

    createExportFileMock.mockResolvedValueOnce(file).mockResolvedValueOnce(null);

    // action
    await exportNode('node-a', 'Icon', bounds, [setting({ format: ExportFormat.png }), setting({ format: ExportFormat.jpeg })]);

    // result
    expect(createExportZipBlobMock).not.toHaveBeenCalled();
    expect(downloadBlobMock).toHaveBeenCalledWith(file.blob, 'Icon.png');
  });

  it('should do nothing when every row failed to render', async () => {
    // mock
    createExportFileMock.mockResolvedValue(null);

    // action
    await exportNode('node-a', 'Icon', bounds, [setting({ format: ExportFormat.png })]);

    // result
    expect(downloadBlobMock).not.toHaveBeenCalled();
  });
});
