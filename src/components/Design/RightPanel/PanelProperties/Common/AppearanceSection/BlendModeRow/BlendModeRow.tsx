import { FC } from 'react';
import { useTranslation } from 'react-i18next';

// @xigma
import { Tooltip } from '@xigma/components';

// components
import { UITools } from 'shared';

// hooks
import { useBlendModeRow } from './hooks/useBlendModeRow';

// others
import { MIXED_LABEL } from 'components/Design/RightPanel/PanelProperties/Common/constants';
import { getBlendModeOptions } from './utils/getBlendModeOptions';
import { translationNameSpace } from '../constants';

// types
import { BlendMode } from 'types/design/enums';

const BlendModeRow: FC = () => {
  const { t } = useTranslation();
  const { isActive, onHover, onRemove, onSelect, value } = useBlendModeRow();
  const options = getBlendModeOptions((blendMode) => t(`${translationNameSpace}.blendMode.options.${blendMode}`));

  return isActive ? (
    <UITools.SectionColumn
      buttonsIcon={[
        <Tooltip align="end" content={t(`${translationNameSpace}.blendMode.removeTooltip`)} key="remove">
          <UITools.ButtonIcon ariaLabel={t(`${translationNameSpace}.blendMode.removeAriaLabel`)} name="Minus" onClick={onRemove} />
        </Tooltip>,
      ]}
      gridColumnType={UITools.GridColumnType.single}
      labels={[t(`${translationNameSpace}.blendMode.label`)]}
      withTopMargin
    >
      <UITools.Dropdown<BlendMode>
        bypassGlobalShortcuts={false}
        icon="DropEmpty"
        onHoverOption={onHover}
        onSelect={onSelect}
        options={options}
        placeholder={MIXED_LABEL}
        textAlign="left"
        value={value}
        variant="outline"
      />
    </UITools.SectionColumn>
  ) : null;
};

export default BlendModeRow;
