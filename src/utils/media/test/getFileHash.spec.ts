// utils
import { getFileHash } from '../getFileHash';

const computeFileHashMock = vi.fn();

vi.mock('../computeFileHash', () => ({ computeFileHash: (...args: unknown[]): unknown => computeFileHashMock(...args) }));

describe('getFileHash', () => {
  it('should hash a file once and reuse the pending hash afterwards', async () => {
    // mock
    const file = new Blob(['x']);
    computeFileHashMock.mockResolvedValue('hash');

    // before
    const first = getFileHash(file);
    const second = getFileHash(file);

    // result
    expect(second).toBe(first);
    expect(await first).toBe('hash');
    expect(computeFileHashMock).toHaveBeenCalledTimes(1);
  });
});
