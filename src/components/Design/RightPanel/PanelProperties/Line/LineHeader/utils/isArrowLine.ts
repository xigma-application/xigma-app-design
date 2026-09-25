// others
import { ARROW_ENDPOINTS } from '../constants';

// types
import { LineEndpoint } from 'types/design/enums';
import { TLineNode } from 'types/design/types';

export const isArrowLine = (node: TLineNode): boolean =>
  ARROW_ENDPOINTS.includes(node.startPoint ?? LineEndpoint.none) || ARROW_ENDPOINTS.includes(node.endPoint ?? LineEndpoint.none);
