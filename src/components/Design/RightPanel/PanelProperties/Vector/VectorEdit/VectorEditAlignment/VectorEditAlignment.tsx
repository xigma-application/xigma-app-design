import { FC } from 'react';
import { useTranslation } from 'react-i18next';

// components
import DistributeMenuButton from '../../../Common/PositionSection/ColumnAlignment/DistributeMenu/DistributeMenuButton';
import { UITools } from 'shared';

// hooks
import { useVectorEditAlignment } from '../hooks/useVectorEditAlignment';
import { useVectorEditDistributeMenu } from '../hooks/useVectorEditDistributeMenu';

// others
import { HORIZONTAL_ALIGNMENT_OPTIONS, translationNameSpace, VERTICAL_ALIGNMENT_OPTIONS } from '../../../Common/PositionSection/ColumnAlignment/constants';

// styles
import styles from '../../../Common/PositionSection/ColumnAlignment/column-alignment.module.scss';

// utils
import { buildAlignmentButtons } from '../../../Common/PositionSection/ColumnAlignment/utils/buildAlignmentButtons';

const VectorEditAlignment: FC = () => {
  const { t } = useTranslation();
  const { disabled, onSelectHorizontal, onSelectVertical } = useVectorEditAlignment();
  const distributeMenu = useVectorEditDistributeMenu();

  return (
    <UITools.SectionColumn
      buttonsIcon={[<DistributeMenuButton key="distribute" {...distributeMenu} />]}
      gridColumnType={UITools.GridColumnType.twoInputs}
      labels={[t(`${translationNameSpace}.label`)]}
      withBottomMargin
    >
      <UITools.ButtonGroup
        buttons={buildAlignmentButtons(HORIZONTAL_ALIGNMENT_OPTIONS, disabled, undefined, onSelectHorizontal, t)}
        className={styles.ColumnAlignment__buttons}
        e2eValue="horizontal-alignment"
      />
      <UITools.ButtonGroup
        buttons={buildAlignmentButtons(VERTICAL_ALIGNMENT_OPTIONS, disabled, undefined, onSelectVertical, t)}
        className={styles.ColumnAlignment__buttons}
        e2eValue="vertical-alignment"
      />
    </UITools.SectionColumn>
  );
};

export default VectorEditAlignment;
