import { FC } from 'react';
import { useTranslation } from 'react-i18next';

// components
import GridSettingsHeader from './GridSettingsHeader/GridSettingsHeader';
import GridTrackList from './GridTrackList/GridTrackList';

// hooks
import { useGridSettingsPanel } from './hooks/useGridSettingsPanel';
import { useGridTrackSelectionCoordinator } from './hooks/useGridTrackSelectionCoordinator';

// others
import { getAttributes } from 'shared/E2EDataAttributes/utils/getAttributes';
import { translationNameSpace } from './constants';

// styles
import styles from './grid-settings.module.scss';

// types
import { E2EAttribute } from 'types/e2e';

const COLUMN_INITIAL_SELECTION = [0];

const GridSettings: FC = () => {
  const { t } = useTranslation();
  const { columns, onClose, rows } = useGridSettingsPanel();
  const coordinator = useGridTrackSelectionCoordinator();

  return (
    <div className={styles.GridSettings} {...getAttributes(E2EAttribute.gridSettingsPanel, '')}>
      <GridSettingsHeader onClose={onClose} />
      <GridTrackList
        addAriaLabel={t(`${translationNameSpace}.addColumnAriaLabel`)}
        axis="column"
        controls={columns}
        coordinator={coordinator}
        e2eValue="grid-columns"
        initialSelectedIndices={COLUMN_INITIAL_SELECTION}
        label={t(`${translationNameSpace}.columns.label`)}
      />
      <GridTrackList
        addAriaLabel={t(`${translationNameSpace}.addRowAriaLabel`)}
        axis="row"
        controls={rows}
        coordinator={coordinator}
        e2eValue="grid-rows"
        label={t(`${translationNameSpace}.rows.label`)}
      />
    </div>
  );
};

export default GridSettings;
