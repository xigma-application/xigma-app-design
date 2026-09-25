// utils
import { createGlProxy } from 'test/createGlProxy';
import { getGlassProgram } from '../getGlassProgram';

const createProgramMock = vi.fn();

vi.mock('../../../createProgram', () => ({ createProgram: (...args: unknown[]): unknown => createProgramMock(...args) }));

describe('getGlassProgram', () => {
  it('should compile the glass program once per context', () => {
    // mock
    const gl = createGlProxy({ createBuffer: vi.fn(() => 'buffer') });
    createProgramMock.mockReturnValue('program');

    // before
    const first = getGlassProgram(gl);
    const second = getGlassProgram(gl);

    // result
    expect(first).toEqual({ buffer: 'buffer', program: 'program' });
    expect(second).toBe(first);
    expect(createProgramMock).toHaveBeenCalledTimes(1);
  });

  it('should remember a failed compile or buffer as no program', () => {
    // mock
    createProgramMock.mockReturnValueOnce(null).mockReturnValueOnce('program');

    // result
    expect(getGlassProgram(createGlProxy())).toBeNull();
    expect(getGlassProgram(createGlProxy({ createBuffer: vi.fn(() => null) }))).toBeNull();
  });
});
