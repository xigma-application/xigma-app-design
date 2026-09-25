// others
import { ARC_FIELD_KEYS } from '../constants';

// store
import { selectSelectedNodes } from 'store/design/selectors';
import { useAppDispatch, useAppSelector } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TArcField } from '../types';
import { TEllipseNode } from 'types/design/types';

// utils
import { getArcField } from './utils/getArcField';

export const useEllipseArc = (): TArcField[] => {
  const dispatch = useAppDispatch();
  const nodes = useAppSelector(selectSelectedNodes).filter((node): node is TEllipseNode => node?.type === NodeType.ellipse);

  return ARC_FIELD_KEYS.map((key) => getArcField(dispatch, nodes, key));
};
