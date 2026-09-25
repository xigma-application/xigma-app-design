// others
import { OFFSET_VECTOR_PREVIEW_STROKE } from 'constant/canvas';

// types
import { TOffsetVectorState } from 'store/design/types';
import { StrokeJoin } from 'types/design/enums';
import { TDrawSceneContext } from '../types';

// utils
import { createCanvasRefs } from '../../../../useCanvasRefs/createCanvasRefs';
import { drawOffsetVectorDistanceLabel } from '../drawOffsetVectorDistanceLabel';

const drawValueLabelMock = vi.fn();

vi.mock('utils/canvas/text/drawValueLabel/drawValueLabel', () => ({
  drawValueLabel: (...args: unknown[]): void => drawValueLabelMock(...args),
}));

const context = { canvasHeight: 100, canvasWidth: 100, viewport: { x: 0, y: 0, zoom: 1 } } as TDrawSceneContext;
const offsetVector: TOffsetVectorState = { distance: 97, join: StrokeJoin.miter, nodeId: 'line' };
const edge = { angle: 90, normal: { x: 0, y: 1 }, point: { x: 5, y: 10 } };

describe('drawOffsetVectorDistanceLabel', () => {
  beforeEach(() => {
    drawValueLabelMock.mockClear();
  });

  it('should label the hovered offset outline with the distance in the preview colour', () => {
    // mock
    const refs = createCanvasRefs();
    refs.offsetVector.hoveredOffsetVectorEdgeRef.current = edge;

    // before
    drawOffsetVectorDistanceLabel(context, offsetVector, refs);

    // result
    expect(drawValueLabelMock.mock.calls[0][4]).toBe('97');
    expect(drawValueLabelMock.mock.calls[0][5]).toBe(edge.point);
    expect(drawValueLabelMock.mock.calls[0][6]).toBe(edge.normal);
    expect(drawValueLabelMock.mock.calls[0][10]).toEqual({ fill: OFFSET_VECTOR_PREVIEW_STROKE });
  });

  it('should follow the pointer while the outline is dragged', () => {
    // mock
    const refs = createCanvasRefs();
    const drag = { angle: 90, normal: { x: 0, y: 1 }, point: { x: 7, y: 30 }, startDistance: 10, startPoint: { x: 7, y: 10 } };
    refs.offsetVector.hoveredOffsetVectorEdgeRef.current = edge;
    refs.offsetVector.offsetVectorDragRef.current = drag;

    // before
    drawOffsetVectorDistanceLabel(context, offsetVector, refs);

    // result
    expect(drawValueLabelMock.mock.calls[0][5]).toBe(drag.point);
  });

  it('should draw nothing outside the offset mode or away from the outline', () => {
    // mock
    const refs = createCanvasRefs();

    // before
    drawOffsetVectorDistanceLabel(context, offsetVector, refs);
    refs.offsetVector.hoveredOffsetVectorEdgeRef.current = edge;
    drawOffsetVectorDistanceLabel(context, null, refs);

    // result
    expect(drawValueLabelMock).not.toHaveBeenCalled();
  });
});
