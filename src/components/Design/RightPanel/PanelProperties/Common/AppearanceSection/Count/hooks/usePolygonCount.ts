import { FocusEvent } from 'react';

// others
import { MIXED_LABEL } from 'components/Design/RightPanel/PanelProperties/Common/constants';

// store
import { selectSelectedNodes } from 'store/design/selectors';
import { useAppDispatch, useAppSelector } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TPolygonNode } from 'types/design/types';

// utils
import { commitPolygonCount } from './utils/commitPolygonCount';
import { handlePolygonCountBlur } from './utils/handlePolygonCountBlur';

export type TUsePolygonCountResult = {
  displayValue: string;
  onBlur: (event: FocusEvent<HTMLInputElement>) => void;
  onScrub: (next: number) => void;
  value: number;
};

export const usePolygonCount = (): TUsePolygonCountResult => {
  const dispatch = useAppDispatch();
  const nodes = useAppSelector(selectSelectedNodes).filter((node): node is TPolygonNode => node?.type === NodeType.polygon);
  const value = nodes[0]?.sides ?? 0;
  const displayValue = nodes.some((node) => node.sides !== value) ? MIXED_LABEL : `${value}`;

  return {
    displayValue,
    onBlur: (event): void => handlePolygonCountBlur(event, dispatch, nodes, displayValue),
    onScrub: (next): void => commitPolygonCount(dispatch, nodes, (node) => node.sides + next - value),
    value,
  };
};
