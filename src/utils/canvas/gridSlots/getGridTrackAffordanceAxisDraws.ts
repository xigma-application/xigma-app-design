// types
import { TGridTrackAffordanceHandlePart, TGridTrackAffordanceHover, TGridTrackSelection } from 'types/design/canvas/types';
import { TGridTrackAxis } from 'store/design/utils/autoLayout/gridTracks/types';

export type TGridTrackAffordanceDraw = {
  handlePart: TGridTrackAffordanceHandlePart | null;
  index: number;
  isExpanded: boolean;
};

const pushHoverDraw = (draws: TGridTrackAffordanceDraw[], axis: TGridTrackAxis, hover: TGridTrackAffordanceHover | null): void => {
  if (hover) {
    const index = axis === 'column' ? hover.columnIndex : hover.rowIndex;
    const isHoveredPill = hover.hoveredPillAxis === axis;

    draws.push({ handlePart: isHoveredPill ? hover.hoveredHandlePart : null, index, isExpanded: isHoveredPill });
  }
};

const applySelectionDraws = (draws: TGridTrackAffordanceDraw[], axis: TGridTrackAxis, selection: TGridTrackSelection | null): void => {
  if (selection?.axis === axis) {
    selection.indices.forEach((index) => {
      const existingDraw = draws.find((draw) => draw.index === index);

      if (existingDraw) {
        existingDraw.isExpanded = true;
      } else {
        draws.push({ handlePart: null, index, isExpanded: true });
      }
    });
  }
};

export const getGridTrackAffordanceAxisDraws = (
  axis: TGridTrackAxis,
  hover: TGridTrackAffordanceHover | null,
  selection: TGridTrackSelection | null,
): TGridTrackAffordanceDraw[] => {
  const draws: TGridTrackAffordanceDraw[] = [];

  pushHoverDraw(draws, axis, hover);
  applySelectionDraws(draws, axis, selection);

  return draws;
};
