// others
import { MULTI_SELECTION_DISABLED_FILL_MODES, VECTOR_DISABLED_FILL_MODES } from '../../../constants';

// types
import { NodeType } from 'types/design/enums';
import { TImageFillMode } from 'shared/UITools/ColorPicker/Body/ImagePanel/types';
import { TStyledNode } from '../../../../AppearanceSection/types';
import { TVectorNode } from 'types/design/types';

export const getDisabledFillModes = (nodes: (TStyledNode | TVectorNode)[]): TImageFillMode[] | undefined => {
  switch (true) {
    case nodes.length > 1:
      return MULTI_SELECTION_DISABLED_FILL_MODES;
    case nodes[0]?.type === NodeType.vector:
      return VECTOR_DISABLED_FILL_MODES;
    default:
      return undefined;
  }
};
