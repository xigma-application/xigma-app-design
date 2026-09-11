// types
import { THoverResolverContext, THoverResult } from '../types';

export const resolveGridTrackAffordanceHandleHover = ({ refs }: THoverResolverContext): THoverResult | undefined => {
  const handlePart = refs.hover.hoveredGridTrackAffordanceRef.current?.hoveredHandlePart;

  switch (handlePart) {
    case 'grip':
      return { className: 'hand', cursor: '', nodeId: null };
    case 'value':
      return { className: null, cursor: 'text', nodeId: null };
    default:
      return undefined;
  }
};
