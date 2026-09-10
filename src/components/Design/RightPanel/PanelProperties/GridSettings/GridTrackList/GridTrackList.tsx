import { FC } from 'react';

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
import { TGridTrackAxis } from 'store/design/utils/autoLayout/gridTracks/types';

export type TGridTrackListProps = {
  addAriaLabel: string;
  axis: TGridTrackAxis;
  controls: TGridAxisControls;
  coordinator: TGridTrackSelectionCoordinator;
  e2eValue: string;
  initialSelectedIndices?: number[];
  label: string;
};

export const GridTrackList: FC<TGridTrackListProps> = ({
  addAriaLabel,
  axis,
  controls,
  coordinator,
  e2eValue,
  initialSelectedIndices,
  label,
}) => {
  const list = useGridTrackList(controls, axis, coordinator, initialSelectedIndices);
  const canDelete = controls.tracks.length > 1;

  return (
    <UITools.Section addAriaLabel={addAriaLabel} e2eValue={e2eValue} label={label} onAdd={list.onAdd}>
      <div className={styles.GridTrackList}>
        {list.dropIndicatorIndex !== null && <GridTrackDropIndicator index={list.dropIndicatorIndex} />}
        {controls.tracks.map((track) => (
          <GridTrackRow
            canDelete={canDelete}
            isDragging={list.isRowDragging(track.index)}
            isSelected={list.selectedIndices.includes(track.index)}
            key={track.index}
            onChangeMode={(mode) => list.onChangeMode(track.index, mode)}
            onChangeValue={(value) => list.onChangeValue(track.index, value)}
            onDelete={() => list.onDeleteRow(track.index)}
            onSelect={(modifiers) => list.onSelectRow(track.index, modifiers)}
            onStartDrag={(event) => list.beginDrag(track.index, event)}
            registerRow={list.registerRow(track.index)}
            track={track}
          />
        ))}
      </div>
    </UITools.Section>
  );
};

export default GridTrackList;
