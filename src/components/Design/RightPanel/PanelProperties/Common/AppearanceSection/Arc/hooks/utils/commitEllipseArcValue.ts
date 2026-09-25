// store
import { AppDispatch } from 'store';
import { updateNode } from 'store/design/slice';

// types
import { TArcFieldKey } from '../../types';
import { TEllipseNode } from 'types/design/types';

// utils
import { commitOnNodes } from '../../../utils/commitOnNodes';
import { getEllipseArcChanges } from './getEllipseArcChanges';

export const commitEllipseArcValue = (
  dispatch: AppDispatch,
  nodes: TEllipseNode[],
  key: TArcFieldKey,
  getValue: TFunc<[TEllipseNode], number>,
): void =>
  commitOnNodes(dispatch, nodes, (node) => {
    dispatch(updateNode({ changes: getEllipseArcChanges(node, key, getValue(node)), id: node.id }));
  });
