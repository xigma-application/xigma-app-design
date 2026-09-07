import { useTranslation } from 'react-i18next';

// others
import { FLOW_OPTIONS, translationNameSpace } from '../constants';

// store
import { selectNodes, selectSelectedNodes } from 'store/design/selectors';
import { updateNode } from 'store/design/slice';
import { useAppDispatch, useAppSelector } from 'store';

// types
import { LayoutMode, NodeType, SizingMode } from 'types/design/enums';
import { TToggleButton } from 'shared/UITools/ToggleButtonGroup/types';

// utils
import { getChildrenFillResetChanges } from 'store/design/utils/autoLayout/getChildrenFillResetChanges';

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
  const [selectedNode] = useAppSelector(selectSelectedNodes);
  const nodes = useAppSelector(selectNodes);
  const frameNode = selectedNode?.type === NodeType.frame ? selectedNode : undefined;
  const id = frameNode?.id ?? '';
  const value = frameNode?.layoutMode ?? LayoutMode.freeForm;
  const wrap = frameNode?.layoutWrap ?? false;

  const onChange = (nextValue: string): void => {
    dispatch(updateNode({ changes: { layoutMode: nextValue as LayoutMode, layoutWrap: false }, id }));

    const staysManaged = nextValue === LayoutMode.horizontal || nextValue === LayoutMode.vertical;

    if (!staysManaged && frameNode) {
      getChildrenFillResetChanges(frameNode, 'width', nodes).forEach((childId) => {
        dispatch(updateNode({ changes: { widthSizingMode: SizingMode.fixed }, id: childId }));
      });
      getChildrenFillResetChanges(frameNode, 'height', nodes).forEach((childId) => {
        dispatch(updateNode({ changes: { heightSizingMode: SizingMode.fixed }, id: childId }));
      });
    }
  };

  return {
    onChange,
    onWrapChange: () => dispatch(updateNode({ changes: wrap ? { layoutWrap: false, verticalGap: 0 } : { layoutWrap: true }, id })),
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
