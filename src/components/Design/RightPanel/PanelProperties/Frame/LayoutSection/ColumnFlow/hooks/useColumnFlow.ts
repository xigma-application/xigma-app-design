import { useState } from 'react';
import { useTranslation } from 'react-i18next';

// others
import { FLOW_OPTIONS, translationNameSpace } from '../constants';

// store
import { selectSelectedNodes } from 'store/design/selectors';
import { updateNode } from 'store/design/slice';
import { useAppDispatch, useAppSelector } from 'store';

// types
import { LayoutMode, NodeType } from 'types/design/enums';
import { TToggleButton } from 'shared/UITools/ToggleButtonGroup/types';

export type TUseColumnFlowResult = {
  onChange: TFunc<[string]>;
  onWrapChange: TFunc;
  toggleButtons: TToggleButton[];
  value: string;
  wrap: boolean;
};

export const useColumnFlow = (): TUseColumnFlowResult => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const [wrap, setWrap] = useState(false);
  const [selectedNode] = useAppSelector(selectSelectedNodes);
  const frameNode = selectedNode?.type === NodeType.frame ? selectedNode : undefined;
  const id = frameNode?.id ?? '';
  const value = frameNode?.layoutMode ?? LayoutMode.freeForm;

  return {
    onChange: (nextValue) => dispatch(updateNode({ changes: { layoutMode: nextValue as LayoutMode }, id })),
    onWrapChange: () => setWrap((currentWrap) => !currentWrap),
    toggleButtons: FLOW_OPTIONS.map(({ icon, labelKey, value: optionValue }) => ({
      ariaLabel: t(`${translationNameSpace}.${labelKey}`),
      icon,
      tooltip: t(`${translationNameSpace}.${labelKey}`),
      value: optionValue,
    })),
    value,
    wrap,
  };
};
