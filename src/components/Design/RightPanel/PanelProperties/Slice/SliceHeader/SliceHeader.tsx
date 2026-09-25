import { FC } from 'react';
import { useTranslation } from 'react-i18next';

// components
import PanelHeader from '../../Common/PanelHeader/PanelHeader';
import PanelHeaderComponentButton from '../../Common/PanelHeader/PanelHeaderComponentButton';
import PanelHeaderComponentSplitButton from '../../Common/PanelHeader/PanelHeaderComponentSplitButton';

// others
import { translationNameSpace } from './constants';

// store
import { selectSelectedIds } from 'store/design/selectors';
import { useAppSelector } from 'store';

const SliceHeader: FC = () => {
  const { t } = useTranslation();
  const isMultiple = useAppSelector(selectSelectedIds).length > 1;

  return (
    <PanelHeader
      buttons={isMultiple ? <PanelHeaderComponentSplitButton /> : <PanelHeaderComponentButton />}
      e2eValue="slice"
      label={t(`${translationNameSpace}.label`)}
    />
  );
};

export default SliceHeader;
