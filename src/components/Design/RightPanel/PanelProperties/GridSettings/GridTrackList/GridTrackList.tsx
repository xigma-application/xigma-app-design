import { FC, ReactNode, useEffect } from 'react';

// components
import GridTrackDropIndicator from './GridTrackDropIndicator';
import GridTrackRow from './GridTrackRow/GridTrackRow';
import { UITools } from 'shared';

// hooks
import { TGridAxisControls } from '../hooks/types';
import { TGridTrackSelectionCoordinator } from '../hooks/useGridTrackSelectionCoordinator';
import { useGridTrackList } from './hooks/useGridTrackList/useGridTrackList';

// styles
import styles from './grid-track-list.module.scss';

// types
import { TGridCellPosition } from 'types/design/canvas/types';
import { TGridTrackAxis } from 'store/design/utils/autoLayout/gridTracks/types';

// utils
import { getGridSectionCells } from './utils/getGridSectionCells';

export type TGridTrackListProps = {
  addAriaLabel: string;
  addTooltip: ReactNode;
  axis: TGridTrackAxis;
  controls: TGridAxisControls;
  coordinator: TGridTrackSelectionCoordinator;
  crossAxisTrackCount: number;
  e2eValue: string;
  externalSelectedIndices?: number[];
  initialSelectedIndices?: number[];
  label: string;
  onHighlightCellsChange: (cells: TGridCellPosition[]) => void;
  onSelectedIndicesChange?: (indices: number[]) => void;
};

export const GridTrackList: FC<TGridTrackListProps> = ({
  addAriaLabel,
  addTooltip,
  axis,
  controls,
  coordinator,
  crossAxisTrackCount,
  e2eValue,
  externalSelectedIndices,
  initialSelectedIndices,
  label,
  onHighlightCellsChange,
  onSelectedIndicesChange,
}) => {
  const list = useGridTrackList(controls, axis, coordinator, initialSelectedIndices, externalSelectedIndices);

  useEffect(() => {
    onHighlightCellsChange(getGridSectionCells(axis, list.selectedIndices, crossAxisTrackCount));
  }, [axis, crossAxisTrackCount, list.selectedIndices, onHighlightCellsChange]);

  useEffect(() => {
    onSelectedIndicesChange?.(list.selectedIndices);
  }, [list.selectedIndices, onSelectedIndicesChange]);

  return (
    <UITools.Section addAriaLabel={addAriaLabel} addTooltip={addTooltip} e2eValue={e2eValue} label={label} onAdd={list.onAdd}>
      <div className={styles.GridTrackList}>
        {list.dropIndicatorIndex !== null && <GridTrackDropIndicator index={list.dropIndicatorIndex} />}
        {controls.tracks.map((track) => (
          <GridTrackRow
            axis={axis}
            canDelete
            isDragging={list.isRowDragging(track.index)}
            isSelected={list.selectedIndices.includes(track.index)}
            key={track.index}
            onChangeMode={(mode, value) => list.onChangeMode(track.index, mode, value)}
            onChangeValue={(value) => list.onChangeValue(track.index, value)}
            onDelete={() => list.onDeleteRow(track.index)}
            onSelect={(modifiers) => list.onSelectRow(track.index, modifiers)}
            onStartDrag={(event) => list.beginDrag(track.index, event)}
            registerRow={list.registerRow(track.index)}
            selectedCount={list.selectedIndices.length}
            track={track}
            trackCount={controls.tracks.length}
          />
        ))}
      </div>
    </UITools.Section>
  );
};

export default GridTrackList;
