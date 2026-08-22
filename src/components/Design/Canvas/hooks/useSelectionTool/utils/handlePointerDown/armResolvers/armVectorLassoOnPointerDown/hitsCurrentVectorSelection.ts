// types
import { TArmContext } from '../../types';

// utils
import { hitsMultiSelectBox } from './hitsMultiSelectBox';
import { hitsSelectedHandle } from './hitsSelectedHandle';
import { hitsSelectedSegment } from './hitsSelectedSegment';
import { hitsSelectedVertex } from './hitsSelectedVertex';

export const hitsCurrentVectorSelection = (context: TArmContext, vectorEditingNodeIds: string[]): boolean =>
  hitsSelectedVertex(context, vectorEditingNodeIds) ||
  hitsSelectedHandle(context, vectorEditingNodeIds) ||
  hitsSelectedSegment(context, vectorEditingNodeIds) ||
  hitsMultiSelectBox(context, vectorEditingNodeIds);
