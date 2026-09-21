// utils
import { downloadBlob } from '../downloadBlob';

describe('downloadBlob', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should trigger a click on an anchor pointing at an object URL for the blob, then revoke it', () => {
    // mock
    const blob = { size: 4, type: 'image/png' } as Blob;

    vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock-url');

    const revokeObjectURL = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined);
    const click = vi.fn();
    const link = { click, download: '', href: '' } as unknown as HTMLAnchorElement;

    vi.spyOn(document, 'createElement').mockReturnValue(link);

    // action
    downloadBlob(blob, 'export.png');

    // result
    expect(URL.createObjectURL).toHaveBeenCalledWith(blob);
    expect(link.href).toBe('blob:mock-url');
    expect(link.download).toBe('export.png');
    expect(click).toHaveBeenCalledTimes(1);
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:mock-url');
  });
});
