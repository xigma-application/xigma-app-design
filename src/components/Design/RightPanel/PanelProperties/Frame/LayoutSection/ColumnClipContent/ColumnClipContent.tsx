import { FC } from 'react';
import { useTranslation } from 'react-i18next';

// components
import { UITools } from 'shared';

// hooks
import { useColumnClipContent } from './hooks/useColumnClipContent';

// others
import { translationNameSpace } from './constants';

const ColumnClipContent: FC = () => {
  const { t } = useTranslation();
  const { clipContent, onChange } = useColumnClipContent();

  return (
    <UITools.SectionColumn withBottomMargin withTopMargin>
      <UITools.Checkbox e2eValue="clip-content" label={t(`${translationNameSpace}.label`)} onChange={onChange} value={clipContent} />
    </UITools.SectionColumn>
  );
};

export default ColumnClipContent;
