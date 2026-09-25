// utils
import { computeFileHash } from '../computeFileHash';

describe('computeFileHash', () => {
  it('should return the hex SHA-256 digest of the file content', async () => {
    // mock
    const file = new Blob(['abc']);
    Object.assign(file, { arrayBuffer: async (): Promise<ArrayBuffer> => new TextEncoder().encode('abc').buffer });

    // result
    expect(await computeFileHash(file)).toBe('ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');
  });
});
