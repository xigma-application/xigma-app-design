import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { noop } from 'lodash';

// components
import { UITools } from 'shared';

// others
import {
  DISTRIBUTE_MENU_TRIGGER_ICON,
  HORIZONTAL_ALIGNMENT_OPTIONS,
  translationNameSpace,
  VERTICAL_ALIGNMENT_OPTIONS,
} from '../../../Common/PositionSection/ColumnAlignment/constants';

// styles
import styles from '../../../Common/PositionSection/ColumnAlignment/column-alignment.module.scss';

// utils
import { buildAlignmentButtons } from '../../../Common/PositionSection/ColumnAlignment/utils/buildAlignmentButtons';

const VectorEditAlignment: FC = () => {
  const { t } = useTranslation();

  return (
    <UITools.SectionColumn
      buttonsIcon={[
        <UITools.ButtonIcon
          ariaLabel={t(`${translationNameSpace}.moreActions`)}
          disabled
          key="distribute"
          name={DISTRIBUTE_MENU_TRIGGER_ICON}
        />,
      ]}
      gridColumnType={UITools.GridColumnType.twoInputs}
      labels={[t(`${translationNameSpace}.label`)]}
      withBottomMargin
    >
      <UITools.ButtonGroup
        buttons={buildAlignmentButtons(HORIZONTAL_ALIGNMENT_OPTIONS, true, undefined, noop, t)}
        className={styles.ColumnAlignment__buttons}
        e2eValue="horizontal-alignment"
      />
      <UITools.ButtonGroup
        buttons={buildAlignmentButtons(VERTICAL_ALIGNMENT_OPTIONS, true, undefined, noop, t)}
        className={styles.ColumnAlignment__buttons}
        e2eValue="vertical-alignment"
      />
    </UITools.SectionColumn>
  );
};

export default VectorEditAlignment;
