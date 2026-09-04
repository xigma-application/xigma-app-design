import { FC } from 'react';
import { useTranslation } from 'react-i18next';

// components
import ColumnBackground from './ColumnBackground/ColumnBackground';
import { Section } from 'shared';

// others
import { translationNameSpace } from './constants';

const Design: FC = () => {
  const { t } = useTranslation();

  return (
    <Section e2eValue="background" label={t(`${translationNameSpace}.section.1.label`)}>
      <ColumnBackground />
    </Section>
  );
};

export default Design;
