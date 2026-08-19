// types
import { TVectorNodeOrigin } from 'types/design/selectionTool/types';

// utils
import { getAnchorCorrectionDelta } from '../getAnchorCorrectionDelta';

const origin: TVectorNodeOrigin = { segments: {}, vertices: { v1: { x: 0, y: 0 }, v2: { x: 10, y: 10 } } };
const scaledVertices = { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 20, y: 20 } };

describe('getAnchorCorrectionDelta', () => {
  it('should offset the scaled shape so its solved anchor position lines up with the pre-scale bounds scaled by scaleX/scaleY', () => {
    // mock
    const rotatedAnchorSolver = vi.fn().mockReturnValue({ x: 100, y: 50 });

    // before
    const delta = getAnchorCorrectionDelta(origin, {}, scaledVertices, 2, 2, rotatedAnchorSolver);

    // result — origin bounds are 10x10, scaled by 2 -> solver is asked for a 20x20 box's anchor position;
    // solved center (110, 60) minus the scaled vertices' own center (10, 10)
    expect(rotatedAnchorSolver).toHaveBeenCalledWith(20, 20);
    expect(delta).toEqual({ x: 100, y: 50 });
  });
});
