import { FC } from 'react';
import { useTranslation } from 'react-i18next';

// components
import { UITools } from 'shared';

// hooks
import { useColumnAlignment } from './hooks/useColumnAlignment';

// others
import { HORIZONTAL_ALIGNMENT_OPTIONS, translationNameSpace, VERTICAL_ALIGNMENT_OPTIONS } from './constants';

// utils
import { buildAlignmentButtons } from './utils/buildAlignmentButtons';

const ColumnAlignment: FC = () => {
  const { t } = useTranslation();
  const { disabled, horizontal, onSelectHorizontal, onSelectVertical, vertical } = useColumnAlignment();

  return (
    <UITools.SectionColumn gridColumnType={UITools.GridColumnType.twoInputs} labels={[t(`${translationNameSpace}.label`)]} withBottomMargin>
      <UITools.ButtonGroup
        buttons={buildAlignmentButtons(HORIZONTAL_ALIGNMENT_OPTIONS, disabled, horizontal, onSelectHorizontal, t)}
        e2eValue="horizontal-alignment"
      />
      <UITools.ButtonGroup
        buttons={buildAlignmentButtons(VERTICAL_ALIGNMENT_OPTIONS, disabled, vertical, onSelectVertical, t)}
        e2eValue="vertical-alignment"
      />
    </UITools.SectionColumn>
  );
};

export default ColumnAlignment;
