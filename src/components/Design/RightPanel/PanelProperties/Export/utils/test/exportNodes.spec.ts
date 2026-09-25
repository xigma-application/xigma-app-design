// types
import { TExportSetting } from '../../types';

// utils
import { exportNodes } from '../exportNodes';

const renderMock = vi.fn();
const downloadMock = vi.fn();

vi.mock('../renderNodeExportFiles', () => ({ renderNodeExportFiles: (...args: unknown[]): unknown => renderMock(...args) }));
vi.mock('../downloadExportFiles', () => ({ downloadExportFiles: (...args: unknown[]): unknown => downloadMock(...args) }));
vi.mock('../getUniqueExportFiles', () => ({ getUniqueExportFiles: (files: unknown[]): unknown => ({ unique: files }) }));

describe('exportNodes', () => {
  it('should render every target in order and download all files under unique names', async () => {
    // mock
    const settings = [{}] as TExportSetting[];
    renderMock.mockImplementation(async (id: string) => [`${id}-file`]);

    // before
    await exportNodes(
      [
        { id: 'a', name: 'A' },
        { id: null, name: 'Page' },
      ],
      settings,
      'Export',
    );

    // result
    expect(renderMock).toHaveBeenNthCalledWith(1, 'a', 'A', settings);
    expect(renderMock).toHaveBeenNthCalledWith(2, null, 'Page', settings);
    expect(downloadMock).toHaveBeenCalledWith({ unique: ['a-file', 'null-file'] }, 'Export');
  });
});
