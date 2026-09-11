// types
import { SizingMode } from 'types/design/enums';
import { TDrawSceneContext } from '../../types';

// utils
import { drawGridTrackAffordanceAxis } from '../drawGridTrackAffordanceAxis';

const drawGridTrackAffordanceExpandedMock = vi.fn();
const drawGridTrackAffordancePillMock = vi.fn();

vi.mock('../drawGridTrackAffordanceExpanded/drawGridTrackAffordanceExpanded', () => ({
  drawGridTrackAffordanceExpanded: (...args: unknown[]): void => drawGridTrackAffordanceExpandedMock(...args),
}));
vi.mock('../drawGridTrackAffordancePill', () => ({
  drawGridTrackAffordancePill: (...args: unknown[]): void => drawGridTrackAffordancePillMock(...args),
}));

const context = {} as TDrawSceneContext;
const center = { x: 10, y: 20 };
const rotationCenter = { x: 0, y: 0 };

describe('drawGridTrackAffordanceAxis', () => {
  beforeEach(() => {
    drawGridTrackAffordanceExpandedMock.mockClear();
    drawGridTrackAffordancePillMock.mockClear();
  });

  it('should draw the collapsed pill when the axis is not the hovered one', () => {
    drawGridTrackAffordanceAxis(context, center, 'column', false, null, { mode: SizingMode.fill, value: 1 }, 100, 0, rotationCenter, null);

    expect(drawGridTrackAffordancePillMock).toHaveBeenCalledWith(context, center, 'column', 0, rotationCenter);
    expect(drawGridTrackAffordanceExpandedMock).not.toHaveBeenCalled();
  });

  it('should draw the expanded control with the formatted track value when the axis is expanded', () => {
    drawGridTrackAffordanceAxis(context, center, 'row', true, 'grip', { mode: SizingMode.fill, value: 2 }, 100, 0, rotationCenter, null);

    expect(drawGridTrackAffordanceExpandedMock).toHaveBeenCalledWith(context, center, 'row', '2fr', 'grip', 0, rotationCenter, false);
    expect(drawGridTrackAffordancePillMock).not.toHaveBeenCalled();
  });

  it('should draw the live-edited text and flag the pill as being edited while the value is being edited', () => {
    drawGridTrackAffordanceAxis(context, center, 'row', true, 'grip', { mode: SizingMode.fill, value: 2 }, 100, 0, rotationCenter, '25');

    expect(drawGridTrackAffordanceExpandedMock).toHaveBeenCalledWith(context, center, 'row', '25', 'grip', 0, rotationCenter, true);
  });
});
