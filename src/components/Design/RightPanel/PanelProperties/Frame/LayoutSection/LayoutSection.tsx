import { FC } from 'react';
import { useTranslation } from 'react-i18next';

// components
import ColumnFlow from './ColumnFlow/ColumnFlow';
import { Section } from 'shared';

// others
import { translationNameSpace } from './constants';

const LayoutSection: FC = () => {
  const { t } = useTranslation();

  return (
    <Section e2eValue="layout" label={t(`${translationNameSpace}.label`)}>
      <ColumnFlow />
    </Section>
  );
};

export default LayoutSection;
