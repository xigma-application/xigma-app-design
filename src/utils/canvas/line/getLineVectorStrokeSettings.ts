// others
import { LINE_VECTOR_STROKE_SETTING_KEYS } from './constants';

// types
import { TLineNode, TVectorNode } from 'types/design/types';

export const getLineVectorStrokeSettings = (line: TLineNode): Partial<TVectorNode> =>
  Object.fromEntries(LINE_VECTOR_STROKE_SETTING_KEYS.filter((key) => line[key] !== undefined).map((key) => [key, line[key]]));
