// others
import { translationNameSpace as parentNameSpace } from '../../constants';

// types
import { TAlignTextBaseline, TAutoSpacing, TCanvasStacking, TInsideStroke, TLayoutVersion } from './types';
import { InsideStroke } from 'types/design/enums';

export const translationNameSpace = `${parentNameSpace}.popoverAutoLayoutSettings`;

export const INSIDE_STROKE_VALUES: readonly TInsideStroke[] = [InsideStroke.included, InsideStroke.excluded];
export const CANVAS_STACKING_VALUES: readonly TCanvasStacking[] = ['lastOnTop', 'firstOnTop'];
export const AUTO_SPACING_VALUES: readonly TAutoSpacing[] = ['between', 'around', 'evenly'];
export const LAYOUT_VERSION_VALUES: readonly TLayoutVersion[] = ['updated', 'legacy'];
export const ALIGN_TEXT_BASELINE_VALUES: readonly TAlignTextBaseline[] = ['off', 'on'];
