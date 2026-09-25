// others
import { translationNameSpace as parentNameSpace } from '../constants';

// types
import { LineEndpoint } from 'types/design/enums';

export const translationNameSpace = `${parentNameSpace}.header`;

export const ARROW_ENDPOINTS = [
  LineEndpoint.circleArrow,
  LineEndpoint.diamondArrow,
  LineEndpoint.lineArrow,
  LineEndpoint.reversedTriangle,
  LineEndpoint.triangleArrow,
];
