import { useEffect, useRef, useState } from 'react';

// hooks
import { useClearFillSelectionOnOutsideClick } from '../../../Common/FillSection/hooks/useFillSection/hooks/useClearFillSelectionOnOutsideClick/useClearFillSelectionOnOutsideClick';
import { useItemsReorderDrag } from '../../../Common/FillSection/hooks/useFillSection/hooks/useItemsReorderDrag/useItemsReorderDrag';

// store
import { selectSelectedNodes } from 'store/design/selectors';
import { useAppSelector } from 'store';

// types
import { TExportSetting } from '../../types';
import { TUseExportSectionResult } from './types';

// utils
import { createExportSetting } from './utils/createExportSetting';
import { resolveFillDragIndices } from '../../../Common/FillSection/hooks/useFillSection/utils/resolveFillDragIndices';

export const useExportSection = (): TUseExportSectionResult => {
  const selectedNodes = useAppSelector(selectSelectedNodes);
  const node = selectedNodes.length === 1 ? selectedNodes[0] : undefined;
  const [settings, setSettings] = useState<TExportSetting[]>([]);
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const { beginDrag, dragState, registerRow } = useItemsReorderDrag(settings, setSettings, setSelectedIndices, containerRef);

  useClearFillSelectionOnOutsideClick(containerRef, selectedIndices.length > 0, () => setSelectedIndices([]));

  useEffect(() => {
    setSettings([]);
  }, [node?.id]);

  return {
    containerRef,
    dropIndicatorOffset: dragState?.hasMoved ? dragState.dropOffset : null,
    isRowDragging: (index): boolean => (dragState?.sourceIndices ?? []).includes(index),
    isRowSelected: (index): boolean => selectedIndices.includes(index),
    node,
    onAdd: (): void => setSettings((previous) => [...previous, createExportSetting()]),
    onChange: (index, next): void => setSettings((previous) => previous.map((setting, i) => (i === index ? next : setting))),
    onRemove: (index): void => setSettings((previous) => previous.filter((_, i) => i !== index)),
    onSelectRow: (index): void => setSelectedIndices([index]),
    onStartDrag: (index, event): void => beginDrag(resolveFillDragIndices(selectedIndices, setSelectedIndices, index), index, event),
    registerRow,
    settings,
  };
};
