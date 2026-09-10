import { FC } from 'react';
import { useTranslation } from 'react-i18next';

// components
import ColumnRotationField from './ColumnRotationField/ColumnRotationField';
import { UITools } from 'shared';

// hooks
import { useColumnRotation } from './hooks/useColumnRotation';

// others
import { translationNameSpace } from './constants';

const ColumnRotation: FC = () => {
  const { t } = useTranslation();
  const { buttons, onBlur, onDragEnd, onDragStart, onScrub, rotation } = useColumnRotation();

  return (
    <UITools.SectionColumn gridColumnType={UITools.GridColumnType.twoInputs} labels={[t(`${translationNameSpace}.label`)]} withBottomMargin>
      <ColumnRotationField
        ariaLabel={t(`${translationNameSpace}.ariaLabel`)}
        e2eValue="rotation"
        onBlur={onBlur}
        onDragEnd={onDragEnd}
        onDragStart={onDragStart}
        onScrub={onScrub}
        value={rotation}
      />
      <UITools.ButtonGroup buttons={buttons} e2eValue="rotation-options" />
    </UITools.SectionColumn>
  );
};

export default ColumnRotation;
