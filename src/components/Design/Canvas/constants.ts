// others
import { SECTION_NAME_LABEL_FILL } from 'constant/canvas';
import { translationNameSpace as parentNameSpace } from '../constants';

// types
import { ToolName } from 'types/design/enums';

export const translationNameSpace = `${parentNameSpace}.canvas`;

export const DRAWING_TOOLS: ToolName[] = [
  ToolName.frame,
  ToolName.section,
  ToolName.slice,
  ToolName.rectangle,
  ToolName.line,
  ToolName.ellipse,
  ToolName.polygon,
  ToolName.star,
  ToolName.media,
  ToolName.text,
  ToolName.textOnPath,
];
export const AXIS_LOCK_THRESHOLD_PX = 4;
export const ELLIPSE_ARC_GUIDE_LINE_WIDTH = 1;
export const ELLIPSE_ARC_LAP_SNAP_DEGREES = 3;
export const ELLIPSE_FILL = '#D9D9D9';
export const FRAME_FILL = '#FFFFFF';
export const LINE_STROKE = '#ffffff';
export const RECTANGLE_FILL = '#D9D9D9';
export const SECTION_FILL = SECTION_NAME_LABEL_FILL;
export const RESIZE_DEBOUNCE_MS = 500;
export const DEFAULT_SHAPE_SIZE = 100;
export const DUPLICATE_OFFSET = 10;
export const MIN_DRAG_DISTANCE_PX = 2;
export const MIN_SHAPE_SIZE = 1;
export const NUDGE_STEP = 1;
export const NUDGE_STEP_LARGE = 10;
export const PATH_NAME = 'Path';
export const PATH_START_OFFSET_TOP = 0.75;
export const PENCIL_CHUNK_LENGTH_PX = 30;
export const PENCIL_NAME = 'Pencil';
export const PENCIL_SIMPLIFY_TOLERANCE_PX = 4;
export const PENCIL_STROKE = '#ffffff';
export const PENCIL_STROKE_WIDTH = 2;
export const PENCIL_TANGENT_TENSION = 1 / 6;
export const POLYGON_DEFAULT_SIDES = 3;
export const POLYGON_MIN_SIDES = 3;
export const POLYGON_MAX_SIDES = 60;
export const STAR_DEFAULT_POINTS = 5;
export const STAR_DEFAULT_RATIO = 0.382;
export const STAR_MIN_POINTS = 3;
export const STAR_MAX_POINTS = 60;
export const STAR_MIN_RATIO = 0.001;
export const STAR_MAX_RATIO = 1;
export const TEXT_FILL = '#FFFFFF';
export const TEXT_FONT_FAMILY = 'Inter MSDF';
export const TEXT_FONT_SIZE = 14;
export const TEXT_NAME = 'Text';
export const TEXT_ON_PATH_ATTACH_SLOP_PX = 4;
export const VECTOR_FILL = '#D9D9D9';
export const VECTOR_NAME = 'Vector';
export const VECTOR_PATH_START_OFFSET_START = 0;
export const VECTOR_STROKE = '#000000';
export const WEBGL_CONTEXT_ID = 'webgl2';
export const WEBGL_CONTEXT_ATTRIBUTES: WebGLContextAttributes = { premultipliedAlpha: false, stencil: true };
export const ZOOM_MIN = 0.1;
export const ZOOM_MAX = 256;
export const ZOOM_DELTA_THRESHOLD = 20;
export const ZOOM_STEP_TRACKPAD = 0.032;
export const ZOOM_STEP_WHEEL = 0.0768;
