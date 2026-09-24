import { FC, Fragment } from 'react';
import { useTranslation } from 'react-i18next';

// components
import PanelHeaderBooleanButton from '../../Common/PanelHeader/PanelHeaderBooleanButton';
import PanelHeaderComponentButton from '../../Common/PanelHeader/PanelHeaderComponentButton';
import PanelHeaderComponentSplitButton from '../../Common/PanelHeader/PanelHeaderComponentSplitButton';
import PanelHeaderMaskButton from '../../Common/PanelHeader/PanelHeaderMaskButton';
import { Tooltip, UITools } from 'shared';

// hooks
import { useConvertGroup } from '../hooks/useConvertGroup';

// others
import { translationNameSpace } from './constants';

// store
import { selectSelectedIds } from 'store/design/selectors';
import { useAppSelector } from 'store';

const GroupHeaderButtons: FC = () => {
  const { t } = useTranslation();
  const { onConvertToBoolean, onConvertToMask } = useConvertGroup();
  const isMultiple = useAppSelector(selectSelectedIds).length > 1;

  return (
    <Fragment>
      <Tooltip align="end" content={t(`${translationNameSpace}.htmlTagTooltip`)}>
        <UITools.ButtonIcon ariaLabel={t(`${translationNameSpace}.htmlTagAriaLabel`)} name="HtmlTag" />
      </Tooltip>
      <PanelHeaderMaskButton onClick={onConvertToMask} />
      <PanelHeaderBooleanButton onApply={onConvertToBoolean} />
      {isMultiple ? <PanelHeaderComponentSplitButton /> : <PanelHeaderComponentButton />}
    </Fragment>
  );
};

export default GroupHeaderButtons;
