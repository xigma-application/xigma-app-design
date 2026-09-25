import { FC, Fragment } from 'react';
import { useTranslation } from 'react-i18next';

// components
import StrokeSettingsButton from '../../Common/StrokeSection/StrokeSettingsRow/StrokeSettingsButton/StrokeSettingsButton';
import StrokeWeightField from '../../Common/StrokeSection/StrokeSettingsRow/StrokeWeightField/StrokeWeightField';
import { UITools } from 'shared';

// hooks
import { useLineStrokeSettings } from './hooks/useLineStrokeSettings';

// others
import { MIXED_LABEL } from 'components/Design/RightPanel/PanelProperties/Common/constants';
import { translationNameSpace } from './constants';
import { translationNameSpace as strokeNameSpace } from '../../Common/StrokeSection/constants';

// types
import { LineEndpoint, StrokeAlign } from 'types/design/enums';

// utils
import { getLineEndpointOptions } from './utils/getLineEndpointOptions';
import { getStrokeAlignOptions } from '../../Common/StrokeSection/StrokeSettingsRow/utils/getStrokeAlignOptions';

const LineStrokeSettings: FC = () => {
  const { t } = useTranslation();
  const {
    endPoint,
    isBrush,
    isNonBasicMode,
    isStrokeModeMixed,
    isWeightMixed,
    onEndPointSelect,
    onPositionSelect,
    onStartPointSelect,
    onWeightBlur,
    onWeightDragEnd,
    onWeightDragStart,
    onWeightScrub,
    position,
    startPoint,
    weight,
  } = useLineStrokeSettings();
  const getEndpointLabel = (endpoint: LineEndpoint): string => t(`${translationNameSpace}.endpointOptions.${endpoint}`);

  return (
    <Fragment>
      <UITools.SectionColumn
        buttonsIcon={[<StrokeSettingsButton disabled={isStrokeModeMixed} key="advanced" />]}
        gridColumnType={UITools.GridColumnType.twoInputs}
        labels={[t(`${strokeNameSpace}.position.label`), t(`${strokeNameSpace}.weight.label`)]}
        withTopAlignedButtons
        withTopMargin
      >
        <UITools.Dropdown<StrokeAlign>
          bypassGlobalShortcuts={false}
          disabled={isNonBasicMode}
          onSelect={onPositionSelect}
          options={getStrokeAlignOptions((strokeAlign) => t(`${strokeNameSpace}.position.options.${strokeAlign}`))}
          placeholder={MIXED_LABEL}
          textAlign="left"
          truncate={false}
          value={position}
          variant="outline"
        />
        <StrokeWeightField
          ariaLabel={t(`${strokeNameSpace}.weight.ariaLabel`)}
          displayValue={isWeightMixed ? MIXED_LABEL : `${weight}`}
          onBlur={onWeightBlur}
          onDragEnd={onWeightDragEnd}
          onDragStart={onWeightDragStart}
          onScrub={onWeightScrub}
          scrubValue={weight}
        />
      </UITools.SectionColumn>
      {!isBrush && (
        <UITools.SectionColumn
          gridColumnType={UITools.GridColumnType.twoInputs}
          labels={[t(`${translationNameSpace}.startPoint.label`), t(`${translationNameSpace}.endPoint.label`)]}
          withTopMargin
        >
          <UITools.Dropdown<LineEndpoint>
            bypassGlobalShortcuts={false}
            onSelect={onStartPointSelect}
            options={getLineEndpointOptions(getEndpointLabel, false)}
            placeholder={MIXED_LABEL}
            textAlign="left"
            truncate={false}
            value={startPoint}
            variant="outline"
          />
          <UITools.Dropdown<LineEndpoint>
            bypassGlobalShortcuts={false}
            onSelect={onEndPointSelect}
            options={getLineEndpointOptions(getEndpointLabel, true)}
            placeholder={MIXED_LABEL}
            textAlign="left"
            truncate={false}
            value={endPoint}
            variant="outline"
          />
        </UITools.SectionColumn>
      )}
    </Fragment>
  );
};

export default LineStrokeSettings;
