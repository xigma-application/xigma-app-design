// utils
import { getUniqueExportFiles } from '../getUniqueExportFiles';

const file = (fileName: string): { blob: Blob; fileName: string } => ({ blob: new Blob(), fileName });

describe('getUniqueExportFiles', () => {
  it('should number repeated file names before their extension', () => {
    // before
    const files = getUniqueExportFiles([file('a.png'), file('a.png'), file('b.png'), file('a.png')]);

    // result
    expect(files.map(({ fileName }) => fileName)).toEqual(['a.png', 'a (2).png', 'b.png', 'a (3).png']);
  });
});
