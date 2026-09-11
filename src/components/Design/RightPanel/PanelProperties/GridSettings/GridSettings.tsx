import { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';

// components
import GridSettingsHeader from './GridSettingsHeader/GridSettingsHeader';
import GridTrackList from './GridTrackList/GridTrackList';

// hooks
import { useGridSectionHighlight } from './hooks/useGridSectionHighlight';
import { useGridSettingsPanel } from './hooks/useGridSettingsPanel';
import { useGridTrackSelectionCoordinator } from './hooks/useGridTrackSelectionCoordinator';
import { useGridTrackSelectionSync } from './hooks/useGridTrackSelectionSync';

// others
import { getAttributes } from 'shared/E2EDataAttributes/utils/getAttributes';
import { COLUMN_INITIAL_SELECTION, translationNameSpace } from './constants';
import { getActiveSelectedIndices } from './utils/getActiveSelectedIndices';
import { getExternalSelectedIndices } from './utils/getExternalSelectedIndices';

// store
import { selectGridTrackSelection } from 'store/design/selectors';
import { useAppSelector } from 'store';

// styles
import styles from './grid-settings.module.scss';

// types
import { E2EAttribute } from 'types/e2e';
import { TGridCellPosition } from 'types/design/canvas/types';

const GridSettings: FC = () => {
  const { t } = useTranslation();
  const { columns, frameId, onClose, rows } = useGridSettingsPanel();
  const coordinator = useGridTrackSelectionCoordinator();
  const [columnCells, setColumnCells] = useState<TGridCellPosition[]>([]);
  const [rowCells, setRowCells] = useState<TGridCellPosition[]>([]);
  const [columnSelectedIndices, setColumnSelectedIndices] = useState<number[]>([]);
  const [rowSelectedIndices, setRowSelectedIndices] = useState<number[]>([]);
  const gridTrackSelection = useAppSelector(selectGridTrackSelection);
  const externalColumnIndices = getExternalSelectedIndices('column', frameId, gridTrackSelection);
  const externalRowIndices = getExternalSelectedIndices('row', frameId, gridTrackSelection);
  const activeSelectedIndices = getActiveSelectedIndices(coordinator.activeAxis, columnSelectedIndices, rowSelectedIndices);

  useGridSectionHighlight(frameId, columnCells, rowCells);
  useGridTrackSelectionSync(frameId, coordinator.activeAxis, activeSelectedIndices);

  return (
    <div className={styles.GridSettings} {...getAttributes(E2EAttribute.gridSettingsPanel, '')}>
      <GridSettingsHeader onClose={onClose} />
      <GridTrackList
        addAriaLabel={t(`${translationNameSpace}.addColumnAriaLabel`)}
        addTooltip={t(`${translationNameSpace}.addColumnTooltip`)}
        axis="column"
        controls={columns}
        coordinator={coordinator}
        crossAxisTrackCount={rows.tracks.length}
        e2eValue="grid-columns"
        externalSelectedIndices={externalColumnIndices}
        initialSelectedIndices={COLUMN_INITIAL_SELECTION}
        label={t(`${translationNameSpace}.columns.label`)}
        onHighlightCellsChange={setColumnCells}
        onSelectedIndicesChange={setColumnSelectedIndices}
      />
      <GridTrackList
        addAriaLabel={t(`${translationNameSpace}.addRowAriaLabel`)}
        addTooltip={t(`${translationNameSpace}.addRowTooltip`)}
        axis="row"
        controls={rows}
        coordinator={coordinator}
        crossAxisTrackCount={columns.tracks.length}
        e2eValue="grid-rows"
        externalSelectedIndices={externalRowIndices}
        label={t(`${translationNameSpace}.rows.label`)}
        onHighlightCellsChange={setRowCells}
        onSelectedIndicesChange={setRowSelectedIndices}
      />
    </div>
  );
};

export default GridSettings;
