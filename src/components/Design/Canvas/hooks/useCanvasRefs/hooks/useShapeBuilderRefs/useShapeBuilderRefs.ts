import { useRef } from 'react';

// types
import { TShapeBuilderRefs, TVectorShapeBuilderTouchedFaces } from 'types/design/canvas/types';
import { TPoint } from 'types/canvas';

export const useShapeBuilderRefs = (): TShapeBuilderRefs => {
  const isVectorShapeBuilderBoxModeRef = useRef<boolean>(false);
  const isVectorShapeBuilderSubtractRef = useRef<boolean>(false);
  const touchedVectorShapeBuilderFacesRef = useRef<TVectorShapeBuilderTouchedFaces>({});
  const vectorShapeBuilderPathRef = useRef<TPoint[] | null>(null);
  const shapeBuilderRefsRef = useRef<TShapeBuilderRefs | null>(null);

  if (shapeBuilderRefsRef.current === null) {
    shapeBuilderRefsRef.current = {
      isVectorShapeBuilderBoxModeRef,
      isVectorShapeBuilderSubtractRef,
      touchedVectorShapeBuilderFacesRef,
      vectorShapeBuilderPathRef,
    };
  }

  return shapeBuilderRefsRef.current;
};
