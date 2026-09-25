// @xigma
import { TIconProps } from '@xigma/components';

// others
import { translationNameSpace as parentNameSpace } from '../constants';

// types
import { LineEndpoint } from 'types/design/enums';

export const translationNameSpace = `${parentNameSpace}.strokeSettings`;

export const LINE_ENDPOINT_ORDER = [
  LineEndpoint.none,
  LineEndpoint.round,
  LineEndpoint.square,
  LineEndpoint.lineArrow,
  LineEndpoint.triangleArrow,
  LineEndpoint.reversedTriangle,
  LineEndpoint.circleArrow,
  LineEndpoint.diamondArrow,
];

export const LINE_ENDPOINT_ARROWS_START = LineEndpoint.lineArrow;

export const LINE_ENDPOINT_ICONS: Record<LineEndpoint, TIconProps['name']> = {
  [LineEndpoint.circleArrow]: 'StrokeCapCircleArrow',
  [LineEndpoint.diamondArrow]: 'StrokeCapDiamondArrow',
  [LineEndpoint.lineArrow]: 'StrokeCapLineArrow',
  [LineEndpoint.none]: 'StrokeCapNone',
  [LineEndpoint.reversedTriangle]: 'StrokeCapReversedTriangle',
  [LineEndpoint.round]: 'StrokeCapRound',
  [LineEndpoint.square]: 'StrokeCapSquare',
  [LineEndpoint.triangleArrow]: 'StrokeCapTriangleArrow',
};
