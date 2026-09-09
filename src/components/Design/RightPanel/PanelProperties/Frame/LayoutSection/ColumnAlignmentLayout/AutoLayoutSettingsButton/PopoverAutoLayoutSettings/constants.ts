// others
import { translationNameSpace as parentNameSpace } from '../../constants';

// types
import { TAlignTextBaseline, TAutoSpacing, TCanvasStacking, TInsideStroke, TLayoutVersion } from './types';
import { AlignTextBaseline, AutoSpacing, CanvasStacking, InsideStroke, LayoutVersion } from 'types/design/enums';

export const translationNameSpace = `${parentNameSpace}.popoverAutoLayoutSettings`;

export const INSIDE_STROKE_VALUES: readonly TInsideStroke[] = [InsideStroke.included, InsideStroke.excluded];
export const CANVAS_STACKING_VALUES: readonly TCanvasStacking[] = [CanvasStacking.lastOnTop, CanvasStacking.firstOnTop];
export const AUTO_SPACING_VALUES: readonly TAutoSpacing[] = [AutoSpacing.between, AutoSpacing.around, AutoSpacing.evenly];
export const LAYOUT_VERSION_VALUES: readonly TLayoutVersion[] = [LayoutVersion.updated, LayoutVersion.legacy];
export const ALIGN_TEXT_BASELINE_VALUES: readonly TAlignTextBaseline[] = [AlignTextBaseline.off, AlignTextBaseline.on];
