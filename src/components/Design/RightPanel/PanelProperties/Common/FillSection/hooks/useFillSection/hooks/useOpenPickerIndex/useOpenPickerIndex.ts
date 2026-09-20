import { useEffect, useRef } from 'react';

// store
import { selectOpenPropertyPanel } from 'store/design/selectors';
import { closeOpenPropertyPanel, setOpenPropertyPanel } from 'store/design/slice';
import { TPropertyPanelKind } from 'store/design/types';
import { useAppDispatch, useAppSelector } from 'store';

export type TUseOpenPickerIndexResult = { onPickerOpenChange: (index: number, isOpen: boolean) => void; openPickerIndex: number | null };

export const useOpenPickerIndex = (
  nodeId: string | undefined,
  property: TPropertyPanelKind,
  initialIndex: number | null,
): TUseOpenPickerIndexResult => {
  const dispatch = useAppDispatch();
  const openPanel = useAppSelector(selectOpenPropertyPanel);
  const initialIndexRef = useRef(initialIndex);
  const openPickerIndex = nodeId !== undefined && openPanel?.nodeId === nodeId && openPanel.property === property ? openPanel.index : null;

  useEffect(() => {
    if (nodeId !== undefined && initialIndexRef.current !== null) {
      dispatch(setOpenPropertyPanel({ index: initialIndexRef.current, nodeId, property }));
      initialIndexRef.current = null;
    }
  }, [dispatch, nodeId, property]);

  const onPickerOpenChange = (index: number, isOpen: boolean): void => {
    if (nodeId !== undefined) {
      dispatch((isOpen ? setOpenPropertyPanel : closeOpenPropertyPanel)({ index, nodeId, property }));
    }
  };

  return { onPickerOpenChange, openPickerIndex };
};
