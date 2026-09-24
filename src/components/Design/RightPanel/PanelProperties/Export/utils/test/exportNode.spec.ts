// others
import { DEFAULT_EXPORT_SETTING } from '../../constants';

// store
import { addNode, setSelection } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { ExportColorProfile, ExportFormat, ExportImageResampling, ExportQuality } from '../../enums';
import { NodeType } from 'types/design/enums';
import { TExportSetting } from '../../types';

// utils
import { exportNode } from '../exportNode';
import { exportNodes } from '../exportNodes';

const createExportFileMock = vi.fn();
const createExportZipBlobMock = vi.fn();
const downloadBlobMock = vi.fn();

vi.mock('../createExportFile', () => ({ createExportFile: (...args: unknown[]): unknown => createExportFileMock(...args) }));
vi.mock('../createExportZipBlob', () => ({ createExportZipBlob: (...args: unknown[]): unknown => createExportZipBlobMock(...args) }));
vi.mock('utils/downloadBlob', () => ({ downloadBlob: (...args: unknown[]): void => downloadBlobMock(...args) }));

const setting = (overrides: Partial<TExportSetting> = {}): TExportSetting => ({ ...DEFAULT_EXPORT_SETTING, ...overrides });
const bounds = { height: 100, width: 100, x: 0, y: 0 };

const addRectangle = (): string => {
  store.dispatch(
    addNode({
      fills: [{ color: '#ff0000', opacity: 100, type: 'solid' }],
      height: bounds.height,
      name: 'Icon',
      parentId: null,
      rotation: 0,
      type: NodeType.rectangle,
      width: bounds.width,
      x: bounds.x,
      y: bounds.y,
    }),
  );

  const { rootOrder } = selectActivePage(store.getState());

  return rootOrder[rootOrder.length - 1];
};

describe('exportNode', () => {
  beforeEach(() => {
    createExportFileMock.mockClear();
    createExportZipBlobMock.mockClear();
    downloadBlobMock.mockClear();
  });

  afterEach(() => {
    store.dispatch(setSelection([]));
  });

  it('should build and download an svg row', async () => {
    // mock
    const nodeId = addRectangle();
    const file = { blob: { size: 4, type: 'image/svg+xml' } as Blob, fileName: 'Icon.svg' };

    createExportFileMock.mockResolvedValue(file);

    // action
    await exportNode(nodeId, 'Icon', [setting({ format: ExportFormat.svg })]);

    // result
    expect(createExportFileMock).toHaveBeenCalledWith(
      nodeId,
      ExportFormat.svg,
      1,
      'Icon.svg',
      true,
      DEFAULT_EXPORT_SETTING.imageResampling,
      DEFAULT_EXPORT_SETTING.colorProfile,
      DEFAULT_EXPORT_SETTING.quality,
      bounds,
      false,
      false,
    );
    expect(downloadBlobMock).toHaveBeenCalledWith(file.blob, 'Icon.svg');
  });

  it('should download a single rendered file directly, without zipping', async () => {
    // mock
    const nodeId = addRectangle();
    const file = { blob: { size: 4, type: 'image/png' } as Blob, fileName: 'Icon.png' };

    createExportFileMock.mockResolvedValue(file);

    // action
    await exportNode(nodeId, 'Icon', [setting({ format: ExportFormat.png })]);

    // result
    expect(createExportFileMock).toHaveBeenCalledWith(
      nodeId,
      ExportFormat.png,
      1,
      'Icon.png',
      true,
      DEFAULT_EXPORT_SETTING.imageResampling,
      DEFAULT_EXPORT_SETTING.colorProfile,
      DEFAULT_EXPORT_SETTING.quality,
      bounds,
      false,
      false,
    );
    expect(createExportZipBlobMock).not.toHaveBeenCalled();
    expect(downloadBlobMock).toHaveBeenCalledWith(file.blob, 'Icon.png');
  });

  it('should forward each row own ignoreOverlappingLayers setting', async () => {
    // mock
    const nodeId = addRectangle();
    const file = { blob: { size: 4, type: 'image/png' } as Blob, fileName: 'Icon.png' };

    createExportFileMock.mockResolvedValue(file);

    // action
    await exportNode(nodeId, 'Icon', [setting({ format: ExportFormat.png, ignoreOverlappingLayers: false })]);

    // result
    expect(createExportFileMock).toHaveBeenCalledWith(
      nodeId,
      ExportFormat.png,
      1,
      'Icon.png',
      false,
      DEFAULT_EXPORT_SETTING.imageResampling,
      DEFAULT_EXPORT_SETTING.colorProfile,
      DEFAULT_EXPORT_SETTING.quality,
      bounds,
      false,
      false,
    );
  });

  it('should forward each row own imageResampling setting', async () => {
    // mock
    const nodeId = addRectangle();
    const file = { blob: { size: 4, type: 'image/png' } as Blob, fileName: 'Icon.png' };

    createExportFileMock.mockResolvedValue(file);

    // action
    await exportNode(nodeId, 'Icon', [setting({ format: ExportFormat.png, imageResampling: ExportImageResampling.basic })]);

    // result
    expect(createExportFileMock).toHaveBeenCalledWith(
      nodeId,
      ExportFormat.png,
      1,
      'Icon.png',
      true,
      ExportImageResampling.basic,
      DEFAULT_EXPORT_SETTING.colorProfile,
      DEFAULT_EXPORT_SETTING.quality,
      bounds,
      false,
      false,
    );
  });

  it('should forward each row own colorProfile setting', async () => {
    // mock
    const nodeId = addRectangle();
    const file = { blob: { size: 4, type: 'image/png' } as Blob, fileName: 'Icon.png' };

    createExportFileMock.mockResolvedValue(file);

    // action
    await exportNode(nodeId, 'Icon', [setting({ colorProfile: ExportColorProfile.displayP3, format: ExportFormat.png })]);

    // result
    expect(createExportFileMock).toHaveBeenCalledWith(
      nodeId,
      ExportFormat.png,
      1,
      'Icon.png',
      true,
      DEFAULT_EXPORT_SETTING.imageResampling,
      ExportColorProfile.displayP3,
      DEFAULT_EXPORT_SETTING.quality,
      bounds,
      false,
      false,
    );
  });

  it('should forward each row own quality setting', async () => {
    // mock
    const nodeId = addRectangle();

    createExportFileMock.mockResolvedValue({ blob: { size: 4, type: 'image/jpeg' } as Blob, fileName: 'Icon.jpg' });

    // action
    await exportNode(nodeId, 'Icon', [setting({ format: ExportFormat.jpeg, quality: ExportQuality.low })]);

    // result
    expect(createExportFileMock.mock.calls[0][7]).toBe(ExportQuality.low);
  });

  it('should forward each row own includeBoundingBox, outlineText and includeIdAttribute settings', async () => {
    // mock
    const nodeId = addRectangle();

    createExportFileMock.mockResolvedValue({ blob: { size: 4, type: 'image/svg+xml' } as Blob, fileName: 'Icon.svg' });

    // action
    await exportNode(nodeId, 'Icon', [
      setting({ format: ExportFormat.svg, includeBoundingBox: true, includeIdAttribute: true, outlineText: true }),
    ]);

    // result
    expect(createExportFileMock.mock.calls[0][8]).toEqual(bounds);
    expect(createExportFileMock.mock.calls[0][9]).toBe(true);
    expect(createExportFileMock.mock.calls[0][10]).toBe(true);
  });

  it('should render rows one at a time, not concurrently, since the export-render request is a single slot rather than a queue', async () => {
    // mock — the second row's render must not start until the first row's promise has resolved
    const nodeId = addRectangle();
    let resolveFirst: (file: { blob: Blob; fileName: string } | null) => void = () => {};
    const firstFilePromise = new Promise<{ blob: Blob; fileName: string } | null>((resolve) => {
      resolveFirst = resolve;
    });
    const secondFile = { blob: { size: 4, type: 'image/jpeg' } as Blob, fileName: 'Icon.jpg' };

    createExportFileMock.mockReturnValueOnce(firstFilePromise).mockResolvedValueOnce(secondFile);

    // action
    const exportPromise = exportNode(nodeId, 'Icon', [setting({ format: ExportFormat.png }), setting({ format: ExportFormat.jpeg })]);

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
    const nodeId = addRectangle();
    const firstFile = { blob: { size: 4, type: 'image/png' } as Blob, fileName: 'Icon.png' };
    const secondFile = { blob: { size: 4, type: 'image/jpeg' } as Blob, fileName: 'Icon.jpg' };
    const zipBlob = { size: 100, type: 'application/zip' } as Blob;

    createExportFileMock.mockResolvedValueOnce(firstFile).mockResolvedValueOnce(secondFile);
    createExportZipBlobMock.mockResolvedValue(zipBlob);

    // action
    await exportNode(nodeId, 'Icon', [setting({ format: ExportFormat.png }), setting({ format: ExportFormat.jpeg })]);

    // result
    expect(createExportZipBlobMock).toHaveBeenCalledWith([firstFile, secondFile]);
    expect(downloadBlobMock).toHaveBeenCalledWith(zipBlob, 'Icon.zip');
  });

  it('should drop rows that failed to render and still download whatever succeeded', async () => {
    // mock
    const nodeId = addRectangle();
    const file = { blob: { size: 4, type: 'image/png' } as Blob, fileName: 'Icon.png' };

    createExportFileMock.mockResolvedValueOnce(file).mockResolvedValueOnce(null);

    // action
    await exportNode(nodeId, 'Icon', [setting({ format: ExportFormat.png }), setting({ format: ExportFormat.jpeg })]);

    // result
    expect(createExportZipBlobMock).not.toHaveBeenCalled();
    expect(downloadBlobMock).toHaveBeenCalledWith(file.blob, 'Icon.png');
  });

  it('should do nothing when every row failed to render', async () => {
    // mock
    const nodeId = addRectangle();

    createExportFileMock.mockResolvedValue(null);

    // action
    await exportNode(nodeId, 'Icon', [setting({ format: ExportFormat.png })]);

    // result
    expect(downloadBlobMock).not.toHaveBeenCalled();
  });

  it('should fall back to zero bounds when the node no longer exists in the store', async () => {
    // mock
    createExportFileMock.mockResolvedValue({ blob: { size: 4, type: 'image/png' } as Blob, fileName: 'Icon.png' });

    // action
    await exportNode('missing-node', 'Icon', [setting({ format: ExportFormat.png, includeBoundingBox: true })]);

    // result
    expect(createExportFileMock.mock.calls[0][8]).toEqual({ height: 0, width: 0, x: 0, y: 0 });
  });

  it('should zip the files of several layers together, numbering names that repeat', async () => {
    // mock
    const firstId = addRectangle();
    const secondId = addRectangle();
    const zipBlob = { size: 8, type: 'application/zip' } as Blob;

    createExportFileMock.mockImplementation((_nodeId, _format, _scale, fileName: string) =>
      Promise.resolve({ blob: { size: 4, type: 'image/png' } as Blob, fileName }),
    );
    createExportZipBlobMock.mockResolvedValue(zipBlob);

    // action
    await exportNodes(
      [
        { id: firstId, name: 'Icon' },
        { id: secondId, name: 'Icon' },
      ],
      [setting({ format: ExportFormat.png })],
      'Page 1',
    );

    // result
    expect(createExportZipBlobMock.mock.calls[0][0].map(({ fileName }: { fileName: string }) => fileName)).toEqual([
      'Icon.png',
      'Icon (2).png',
    ]);
    expect(downloadBlobMock).toHaveBeenCalledWith(zipBlob, 'Page 1.zip');
  });
});
