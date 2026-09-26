// store
import { TVectorPointSelection } from 'store/design/types';

// types
import { TVectorHandleHover } from 'types/design/canvas/types';
import { TVectorNode } from 'types/design/types';

export const getSelectedVectorHandles = (node: TVectorNode, selection: TVectorPointSelection): TVectorHandleHover[] =>
  selection.handles.filter(({ end, segmentId }) => node.segments[segmentId]?.[end === 'start' ? 'tangentStart' : 'tangentEnd']);
