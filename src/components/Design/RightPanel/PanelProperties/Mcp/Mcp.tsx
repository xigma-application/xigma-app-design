import { FC, Fragment } from 'react';
import { useTranslation } from 'react-i18next';

// components
import { UITools } from 'shared';

// others
import { translationNameSpace } from './constants';

const Mcp: FC = () => {
  const { t } = useTranslation();

  return (
    <UITools.Section
      addAriaLabel={t(`${translationNameSpace}.addAriaLabel`)}
      addTooltip={t(`${translationNameSpace}.addTooltip`)}
      e2eValue="mcp"
      label={
        <Fragment>
          {t(`${translationNameSpace}.section.label`)}
          <UITools.Chip variant="outline">{t(`${translationNameSpace}.noConnections`)}</UITools.Chip>
        </Fragment>
      }
      onAdd={() => {}}
    />
  );
};

export default Mcp;
