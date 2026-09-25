// types
import { TExportSetting } from '../../types';

// utils
import { renderNodeExportFiles } from '../renderNodeExportFiles';

const createMock = vi.fn();

vi.mock('../getExportBounds', () => ({ getExportBounds: (): unknown => ({ contentBounds: 'content', fullBounds: 'full' }) }));
vi.mock('../getExportFileNames', () => ({
  getExportFileNames: (_name: string, settings: unknown[]): string[] => settings.map((_, index) => `file-${index}`),
}));
vi.mock('../getExportScaleFactor', () => ({ getExportScaleFactor: (scale: string, bounds: string): string => `${scale}@${bounds}` }));
vi.mock('../isSupportedExportFormat', () => ({ isSupportedExportFormat: (format: string): boolean => format !== 'unsupported' }));
vi.mock('../createExportFile', () => ({ createExportFile: (...args: unknown[]): unknown => createMock(...args) }));

const setting = (format: string, includeBoundingBox: boolean): TExportSetting =>
  ({
    colorProfile: 'srgb',
    format,
    ignoreOverlappingLayers: false,
    imageResampling: 'detailed',
    includeBoundingBox,
    includeIdAttribute: true,
    outlineText: false,
    quality: 'high',
    scale: '2x',
  }) as unknown as TExportSetting;

describe('renderNodeExportFiles', () => {
  it('should render every supported setting at its bounds and drop failed renders', async () => {
    // mock
    createMock.mockResolvedValueOnce({ fileName: 'a' }).mockResolvedValueOnce(null);

    // before
    const files = await renderNodeExportFiles('n', 'Node', [setting('png', true), setting('unsupported', false), setting('svg', false)]);

    // result
    expect(files).toEqual([{ fileName: 'a' }]);
    expect(createMock).toHaveBeenNthCalledWith(1, 'n', 'png', '2x@full', 'file-0', false, 'detailed', 'srgb', 'high', 'full', false, true);
    expect(createMock).toHaveBeenNthCalledWith(
      2,
      'n',
      'svg',
      '2x@content',
      'file-1',
      false,
      'detailed',
      'srgb',
      'high',
      'content',
      false,
      true,
    );
  });
});
