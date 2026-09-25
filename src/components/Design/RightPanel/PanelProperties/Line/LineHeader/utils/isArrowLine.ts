// others
import { LINE_ARROW_ENDPOINTS } from 'constant/lineEndpoints';

// types
import { LineEndpoint } from 'types/design/enums';
import { TLineNode } from 'types/design/types';

export const isArrowLine = (node: TLineNode): boolean =>
  LINE_ARROW_ENDPOINTS.includes(node.startPoint ?? LineEndpoint.none) || LINE_ARROW_ENDPOINTS.includes(node.endPoint ?? LineEndpoint.none);
