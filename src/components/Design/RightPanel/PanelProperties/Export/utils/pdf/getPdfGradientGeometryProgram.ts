// types
import { TPdfGradientGeometry } from './getPdfGradientGeometry';

// utils
import { formatPostScriptNumber } from './formatPostScriptNumber';

const num = formatPostScriptNumber;

export const getPdfGradientGeometryProgram = (
  gradientType: 'gradient-angular' | 'gradient-diamond',
  geometry: TPdfGradientGeometry,
  radiusRatio: number,
): string => {
  const { direction, perpendicular, primaryRadius, startPage } = geometry;
  const aScale = gradientType === 'gradient-diamond' && primaryRadius > 0 ? 1 / primaryRadius : 1;
  const bScale = aScale / (radiusRatio || 1);

  const aCoefX = direction.x * aScale;
  const aCoefY = direction.y * aScale;
  const aConst = -(startPage.x * aCoefX + startPage.y * aCoefY);

  const bCoefX = perpendicular.x * bScale;
  const bCoefY = perpendicular.y * bScale;
  const bConst = -(startPage.x * bCoefX + startPage.y * bCoefY);

  const combine = gradientType === 'gradient-angular' ? 'atan 360 div' : 'abs exch abs add';
  const clamp = 'dup 0 lt { pop 0 } if dup 1 gt { pop 1 } if';

  return (
    `2 copy ${num(bCoefY)} mul exch ${num(bCoefX)} mul add ${num(bConst)} add ` +
    `3 1 roll ${num(aCoefY)} mul exch ${num(aCoefX)} mul add ${num(aConst)} add ${combine} ${clamp}`
  );
};
