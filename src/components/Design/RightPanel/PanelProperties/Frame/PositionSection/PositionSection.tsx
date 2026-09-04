import { FC } from 'react';
import { useTranslation } from 'react-i18next';

// components
import ColumnAlignment from './ColumnAlignment/ColumnAlignment';
import { Section } from 'shared';

// others
import { translationNameSpace } from './constants';

const PositionSection: FC = () => {
  const { t } = useTranslation();

  return (
    <Section e2eValue="position" label={t(`${translationNameSpace}.label`)}>
      <ColumnAlignment />
    </Section>
  );
};

export default PositionSection;
