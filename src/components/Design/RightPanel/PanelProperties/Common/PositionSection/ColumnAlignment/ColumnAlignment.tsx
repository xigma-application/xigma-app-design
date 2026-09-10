import { FC } from 'react';
import { useTranslation } from 'react-i18next';

// components
import { UITools } from 'shared';

// hooks
import { useColumnAlignment } from './hooks/useColumnAlignment';

// others
import { HORIZONTAL_ALIGNMENT_OPTIONS, translationNameSpace, VERTICAL_ALIGNMENT_OPTIONS } from './constants';

// styles
import styles from './column-alignment.module.scss';

// utils
import { buildAlignmentButtons } from './utils/buildAlignmentButtons';

const ColumnAlignment: FC = () => {
  const { t } = useTranslation();
  const { disabled, gridHorizontal, gridVertical, horizontal, isGridChild, onSelectHorizontal, onSelectVertical, vertical } =
    useColumnAlignment();
  const displayHorizontal = isGridChild ? gridHorizontal : horizontal;
  const displayVertical = isGridChild ? gridVertical : vertical;

  return (
    <UITools.SectionColumn gridColumnType={UITools.GridColumnType.twoInputs} labels={[t(`${translationNameSpace}.label`)]} withBottomMargin>
      <UITools.ButtonGroup
        buttons={buildAlignmentButtons(HORIZONTAL_ALIGNMENT_OPTIONS, disabled, displayHorizontal, onSelectHorizontal, t)}
        className={styles.ColumnAlignment__buttons}
        e2eValue="horizontal-alignment"
      />
      <UITools.ButtonGroup
        buttons={buildAlignmentButtons(VERTICAL_ALIGNMENT_OPTIONS, disabled, displayVertical, onSelectVertical, t)}
        className={styles.ColumnAlignment__buttons}
        e2eValue="vertical-alignment"
      />
    </UITools.SectionColumn>
  );
};

export default ColumnAlignment;
