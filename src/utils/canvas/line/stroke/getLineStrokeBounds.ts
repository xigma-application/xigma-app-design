// types
import { TDraftRect } from 'types/canvas';
import { TLineNode } from 'types/design/types';

// utils
import { getLineStrokeShape } from './getLineStrokeShape';
import { getPointsBounds } from 'components/Design/Canvas/utils/getVectorDistanceGuides/getPointsBounds';

export const getLineStrokeBounds = (line: TLineNode): TDraftRect | null => getPointsBounds(getLineStrokeShape(line)?.polygons.flat() ?? []);
