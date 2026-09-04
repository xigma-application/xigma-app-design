import { FC } from 'react';
import { useTranslation } from 'react-i18next';

// components
import ColumnBackground from './ColumnBackground/ColumnBackground';
import { UITools } from 'shared';

// others
import { translationNameSpace } from './constants';

const Design: FC = () => {
  const { t } = useTranslation();

  return (
    <UITools.Section e2eValue="background" label={t(`${translationNameSpace}.section.1.label`)}>
      <ColumnBackground />
    </UITools.Section>
  );
};

export default Design;
