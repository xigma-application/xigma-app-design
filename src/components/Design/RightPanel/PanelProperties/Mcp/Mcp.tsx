import { FC, Fragment } from 'react';
import { useTranslation } from 'react-i18next';

// components
import { Chip, Section } from 'shared';

// others
import { translationNameSpace } from './constants';

const Mcp: FC = () => {
  const { t } = useTranslation();

  return (
    <Section
      addAriaLabel={t(`${translationNameSpace}.addAriaLabel`)}
      addTooltip={t(`${translationNameSpace}.addTooltip`)}
      e2eValue="mcp"
      label={
        <Fragment>
          {t(`${translationNameSpace}.section.label`)}
          <Chip variant="outline">{t(`${translationNameSpace}.noConnections`)}</Chip>
        </Fragment>
      }
      onAdd={() => {}}
    />
  );
};

export default Mcp;
