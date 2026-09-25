// utils
import { downloadExportFiles } from '../downloadExportFiles';

const downloadBlobMock = vi.fn();

vi.mock('utils/downloadBlob', () => ({ downloadBlob: (...args: unknown[]): unknown => downloadBlobMock(...args) }));
vi.mock('../createExportZipBlob', () => ({ createExportZipBlob: async (): Promise<string> => 'zip-blob' }));

const file = (fileName: string): { blob: Blob; fileName: string } => ({ blob: new Blob([fileName]), fileName });

describe('downloadExportFiles', () => {
  beforeEach(() => {
    downloadBlobMock.mockClear();
  });

  it('should download a single file as it is', async () => {
    // mock
    const only = file('a.png');

    // before
    await downloadExportFiles([only], 'Export');

    // result
    expect(downloadBlobMock).toHaveBeenCalledWith(only.blob, 'a.png');
  });

  it('should zip several files together', async () => {
    // before
    await downloadExportFiles([file('a.png'), file('b.png')], 'Export');

    // result
    expect(downloadBlobMock).toHaveBeenCalledWith('zip-blob', 'Export.zip');
  });

  it('should download nothing without files', async () => {
    // before
    await downloadExportFiles([], 'Export');

    // result
    expect(downloadBlobMock).not.toHaveBeenCalled();
  });
});
