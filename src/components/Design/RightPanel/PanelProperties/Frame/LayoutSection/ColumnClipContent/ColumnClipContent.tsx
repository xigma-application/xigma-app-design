import { FC } from 'react';
import { useTranslation } from 'react-i18next';

// components
import Checkbox from 'shared/UITools/Checkbox/Checkbox';
import { SectionColumn } from 'shared';

// hooks
import { useColumnClipContent } from './hooks/useColumnClipContent';

// others
import { translationNameSpace } from './constants';

const ColumnClipContent: FC = () => {
  const { t } = useTranslation();
  const { clipContent, onChange } = useColumnClipContent();

  return (
    <SectionColumn withBottomMargin withTopMargin>
      <Checkbox e2eValue="clip-content" label={t(`${translationNameSpace}.label`)} onChange={onChange} value={clipContent} />
    </SectionColumn>
  );
};

export default ColumnClipContent;
