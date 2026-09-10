import { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';

// components
import GridSettingsHeader from './GridSettingsHeader/GridSettingsHeader';
import GridTrackList from './GridTrackList/GridTrackList';

// hooks
import { useGridSectionHighlight } from './hooks/useGridSectionHighlight';
import { useGridSettingsPanel } from './hooks/useGridSettingsPanel';
import { useGridTrackSelectionCoordinator } from './hooks/useGridTrackSelectionCoordinator';

// others
import { getAttributes } from 'shared/E2EDataAttributes/utils/getAttributes';
import { translationNameSpace } from './constants';

// styles
import styles from './grid-settings.module.scss';

// types
import { E2EAttribute } from 'types/e2e';
import { TGridCellPosition } from 'types/design/canvas/types';

const COLUMN_INITIAL_SELECTION = [0];

const GridSettings: FC = () => {
  const { t } = useTranslation();
  const { columns, frameId, onClose, rows } = useGridSettingsPanel();
  const coordinator = useGridTrackSelectionCoordinator();
  const [columnCells, setColumnCells] = useState<TGridCellPosition[]>([]);
  const [rowCells, setRowCells] = useState<TGridCellPosition[]>([]);

  useGridSectionHighlight(frameId, columnCells, rowCells);

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
        initialSelectedIndices={COLUMN_INITIAL_SELECTION}
        label={t(`${translationNameSpace}.columns.label`)}
        onHighlightCellsChange={setColumnCells}
      />
      <GridTrackList
        addAriaLabel={t(`${translationNameSpace}.addRowAriaLabel`)}
        addTooltip={t(`${translationNameSpace}.addRowTooltip`)}
        axis="row"
        controls={rows}
        coordinator={coordinator}
        crossAxisTrackCount={columns.tracks.length}
        e2eValue="grid-rows"
        label={t(`${translationNameSpace}.rows.label`)}
        onHighlightCellsChange={setRowCells}
      />
    </div>
  );
};

export default GridSettings;
