// utils
import { createGlProxy } from 'test/createGlProxy';
import { getTextureProgram } from '../getTextureProgram';

const createProgramMock = vi.fn();

vi.mock('../../../createProgram', () => ({ createProgram: (...args: unknown[]): unknown => createProgramMock(...args) }));

describe('getTextureProgram', () => {
  it('should compile the texture program once per context', () => {
    // mock
    const gl = createGlProxy({ createBuffer: vi.fn(() => 'buffer') });
    createProgramMock.mockReturnValue('program');

    // before
    const first = getTextureProgram(gl);

    // result
    expect(first).toEqual({ buffer: 'buffer', program: 'program' });
    expect(getTextureProgram(gl)).toBe(first);
    expect(createProgramMock).toHaveBeenCalledTimes(1);
  });

  it('should remember a failed compile or buffer as no program', () => {
    // mock
    createProgramMock.mockReturnValueOnce(null).mockReturnValueOnce('program');

    // result
    expect(getTextureProgram(createGlProxy())).toBeNull();
    expect(getTextureProgram(createGlProxy({ createBuffer: vi.fn(() => null) }))).toBeNull();
  });
});
