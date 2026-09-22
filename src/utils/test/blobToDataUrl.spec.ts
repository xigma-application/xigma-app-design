// utils
import { blobToDataUrl } from '../blobToDataUrl';

class MockFileReader {
  onload: (() => void) | null = null;
  onerror: (() => void) | null = null;
  result: string | null = null;
  error: Error | null = null;

  readAsDataURL(): void {
    if (this.result !== null) {
      this.onload?.();
    } else {
      this.onerror?.();
    }
  }
}

describe('blobToDataUrl', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should resolve with the reader result once loaded', async () => {
    // mock
    const reader = new MockFileReader();

    reader.result = 'data:image/png;base64,AAAA';
    vi.spyOn(global, 'FileReader').mockImplementation(function FileReaderMock() {
      return reader as unknown as FileReader;
    } as unknown as typeof FileReader);

    // action
    const result = await blobToDataUrl({} as Blob);

    // result
    expect(result).toBe('data:image/png;base64,AAAA');
  });

  it('should reject with the reader error on failure', async () => {
    // mock
    const reader = new MockFileReader();

    reader.error = new Error('read failed');
    vi.spyOn(global, 'FileReader').mockImplementation(function FileReaderMock() {
      return reader as unknown as FileReader;
    } as unknown as typeof FileReader);

    // action
    const action = blobToDataUrl({} as Blob);

    // result
    await expect(action).rejects.toThrow('read failed');
  });
});
