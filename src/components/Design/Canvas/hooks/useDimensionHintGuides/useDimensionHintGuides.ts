import { useEffect } from 'react';

// store
import { selectHoveredDimensionField, selectSelectedNodes } from 'store/design/selectors';
import { useAppSelector } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TCanvasRefs } from 'types/design/canvas/types';

// utils
import { getDimensionHintGuides } from '../../utils/getDimensionHintGuides/getDimensionHintGuides';

export const useDimensionHintGuides = (refs: TCanvasRefs): void => {
  const field = useAppSelector(selectHoveredDimensionField);
  const selectedNodes = useAppSelector(selectSelectedNodes);
  const frame = selectedNodes.length === 1 && selectedNodes[0].type === NodeType.frame ? selectedNodes[0] : undefined;

  useEffect(() => {
    refs.transform.dimensionHintGuidesRef.current = field && frame ? getDimensionHintGuides(frame, field) : null;

    return (): void => {
      refs.transform.dimensionHintGuidesRef.current = null;
    };
  }, [field, frame, refs]);
};
