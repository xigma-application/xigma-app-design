// others
import { CORNER_RADIUS_MAX, CORNER_RADIUS_MIN } from '../../../constants';

// store
import { AppDispatch } from 'store';
import { updateNode } from 'store/design/slice';

// types
import { NodeType } from 'types/design/enums';
import { TShapeOrVectorNode } from '../../../../../types';

// utils
import { clamp } from 'utils/math/clamp';
import { commitOnNodes } from '../../../../utils/commitOnNodes';

export const commitShapeCornerRadius = (
  dispatch: AppDispatch,
  nodes: TShapeOrVectorNode[],
  getValue: TFunc<[TShapeOrVectorNode], number>,
): void =>
  commitOnNodes(dispatch, nodes, (node) => {
    const cornerRadius = clamp(getValue(node), CORNER_RADIUS_MIN, CORNER_RADIUS_MAX);

    dispatch(
      updateNode({
        changes: node.type === NodeType.vector ? { cornerRadius, cornerRadiusByVertexId: undefined } : { cornerRadius },
        id: node.id,
      }),
    );
  });
