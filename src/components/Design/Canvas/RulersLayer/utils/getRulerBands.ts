// others
import { RULER_FRAME_EXTENT_FILL, RULER_SELECTION_BAND_FILL } from 'constant/canvas';

// types
import { NodeType } from 'types/design/enums';
import { TSceneNode, TViewport } from 'types/design/types';

// utils
import { formatRulerLabel } from './getRulerTicks';
import { getRulerStep } from './getRulerStep';
import { getSelectionBounds } from 'components/Design/Canvas/utils/getSelectionBounds';

export type TRulerBandEdges = {
  fromLabel: string;
  toLabel: string;
};

export type TRulerBand = {
  edges: TRulerBandEdges | null;
  fill: string;
  fromPx: number;
  toPx: number;
};

export type TRulerBands = {
  leftBand: TRulerBand | null;
  origin: { x: number; y: number };
  topBand: TRulerBand | null;
};

export const getRulerBands = (selectedNodes: TSceneNode[], viewport: TViewport): TRulerBands => {
  if (selectedNodes.length === 0) {
    return { leftBand: null, origin: { x: 0, y: 0 }, topBand: null };
  }

  const bounds = getSelectionBounds(selectedNodes);
  const single = selectedNodes.length === 1 ? selectedNodes[0] : null;
  const rebasedFrame = single?.type === NodeType.frame && single.rotation === 0 ? single : null;
  const fill = rebasedFrame ? RULER_FRAME_EXTENT_FILL : RULER_SELECTION_BAND_FILL;
  const step = getRulerStep(viewport.zoom);

  return {
    leftBand: {
      edges: rebasedFrame ? { fromLabel: formatRulerLabel(0, step), toLabel: formatRulerLabel(rebasedFrame.height, step) } : null,
      fill,
      fromPx: bounds.y * viewport.zoom + viewport.y,
      toPx: (bounds.y + bounds.height) * viewport.zoom + viewport.y,
    },
    origin: rebasedFrame ? { x: rebasedFrame.x, y: rebasedFrame.y } : { x: 0, y: 0 },
    topBand: {
      edges: rebasedFrame ? { fromLabel: formatRulerLabel(0, step), toLabel: formatRulerLabel(rebasedFrame.width, step) } : null,
      fill,
      fromPx: bounds.x * viewport.zoom + viewport.x,
      toPx: (bounds.x + bounds.width) * viewport.zoom + viewport.x,
    },
  };
};
