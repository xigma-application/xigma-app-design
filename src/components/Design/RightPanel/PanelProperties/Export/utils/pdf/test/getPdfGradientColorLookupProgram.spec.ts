// types
import { TGradientStop } from 'types/design/paint/types';

// utils
import { getPdfGradientColorLookupProgram } from '../getPdfGradientColorLookupProgram';

describe('getPdfGradientColorLookupProgram', () => {
  it('should build a single slope/intercept snippet for two stops spanning the full domain', () => {
    // before
    const stops: TGradientStop[] = [
      { color: '#ff0000', opacity: 100, position: 0 },
      { color: '#0000ff', opacity: 100, position: 1 },
    ];

    // action
    const program = getPdfGradientColorLookupProgram(stops);

    // result
    expect(program).toBe('dup -1 mul 1 add exch dup 0 mul 0 add exch 1 mul 0 add');
  });

  it('should nest an ifelse dispatch with a leading constant segment when the first stop is past position 0', () => {
    // before
    const stops: TGradientStop[] = [
      { color: '#ffffff', opacity: 100, position: 0.5 },
      { color: '#000000', opacity: 100, position: 1 },
    ];

    // action
    const program = getPdfGradientColorLookupProgram(stops);

    // result
    expect(program).toContain('dup 0.5 le {');
    expect(program).toContain('ifelse');
  });

  it('should add a trailing constant segment when the last stop ends before position 1', () => {
    // before
    const stops: TGradientStop[] = [
      { color: '#ff0000', opacity: 100, position: 0 },
      { color: '#000000', opacity: 100, position: 0.5 },
    ];

    // action
    const program = getPdfGradientColorLookupProgram(stops);

    // result
    expect(program).toContain('dup 0.5 le {');
  });

  it('should avoid dividing by zero when two stops share the same position', () => {
    // before
    const stops: TGradientStop[] = [
      { color: '#ff0000', opacity: 100, position: 0.5 },
      { color: '#000000', opacity: 100, position: 0.5 },
    ];

    // action
    const program = getPdfGradientColorLookupProgram(stops);

    // result
    expect(program).not.toContain('Infinity');
    expect(program).not.toContain('NaN');
  });

  it('should stitch multiple middle segments for three or more stops', () => {
    // before
    const stops: TGradientStop[] = [
      { color: '#ff0000', opacity: 100, position: 0 },
      { color: '#00ff00', opacity: 100, position: 0.5 },
      { color: '#0000ff', opacity: 100, position: 1 },
    ];

    // action
    const program = getPdfGradientColorLookupProgram(stops);

    // result
    expect(program).toContain('dup 0.5 le {');
    expect((program.match(/ifelse/g) ?? []).length).toBe(1);
  });
});
