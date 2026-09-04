import { FC } from 'react';
import { useTranslation } from 'react-i18next';

// components
import { Section } from 'shared';

// others
import { translationNameSpace } from './constants';

const Styles: FC = () => {
  const { t } = useTranslation();

  return (
    <Section
      addAriaLabel={t(`${translationNameSpace}.addAriaLabel`)}
      addTooltip={t(`${translationNameSpace}.addTooltip`)}
      e2eValue="styles"
      label={t(`${translationNameSpace}.section.label`)}
      onAdd={() => {}}
    />
  );
};

export default Styles;
