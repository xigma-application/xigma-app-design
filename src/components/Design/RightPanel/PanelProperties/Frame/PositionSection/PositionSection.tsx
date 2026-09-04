import { FC } from 'react';
import { useTranslation } from 'react-i18next';

// components
import ColumnAlignment from './ColumnAlignment/ColumnAlignment';
import ColumnPosition from './ColumnPosition/ColumnPosition';
import ColumnRotation from './ColumnRotation/ColumnRotation';
import { UITools } from 'shared';

// others
import { translationNameSpace } from './constants';

const PositionSection: FC = () => {
  const { t } = useTranslation();

  return (
    <UITools.Section e2eValue="position" label={t(`${translationNameSpace}.label`)}>
      <ColumnAlignment />
      <ColumnPosition />
      <ColumnRotation />
    </UITools.Section>
  );
};

export default PositionSection;
