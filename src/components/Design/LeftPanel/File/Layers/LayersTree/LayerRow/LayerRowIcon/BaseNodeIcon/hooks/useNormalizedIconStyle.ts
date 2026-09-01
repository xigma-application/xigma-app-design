import { CSSProperties, RefObject, useLayoutEffect, useState } from 'react';

// utils
import { getNormalizedIconTransform } from '../utils/getNormalizedIconTransform';

export const useNormalizedIconStyle = (svgRef: RefObject<SVGSVGElement | null>, name: string, size: number): CSSProperties | undefined => {
  const [style, setStyle] = useState<CSSProperties | undefined>(undefined);

  useLayoutEffect(() => {
    const svg = svgRef.current;

    if (!svg) {
      return;
    }

    setStyle(getNormalizedIconTransform(svg.getBBox(), svg.viewBox.baseVal, size));
  }, [name, size, svgRef]);

  return style;
};
