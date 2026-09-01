// types
import { TMaskConnectorRole } from '../../types';

export const getMaskConnectorOwnRole = (maskIndex: number, index: number): TMaskConnectorRole | undefined => {
  switch (true) {
    case maskIndex <= 0 || index > maskIndex:
      return undefined;
    case index === maskIndex:
      return 'mask';
    case index === 0:
      return 'masked-start';
    default:
      return 'masked-continue';
  }
};
