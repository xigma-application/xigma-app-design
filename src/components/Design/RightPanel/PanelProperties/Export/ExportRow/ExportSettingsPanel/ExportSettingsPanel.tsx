import { FC } from 'react';
import { useTranslation } from 'react-i18next';

// components
import EffectSettingsField from '../../../Common/EffectsSection/EffectSettingsPanel/EffectSettingsField/EffectSettingsField';
import { Tooltip, UITools } from 'shared';

// others
import { getExportColorProfileOptions } from '../../utils/getExportColorProfileOptions';
import { getExportQualityOptions } from '../../utils/getExportQualityOptions';
import { getExportImageResamplingOptions } from '../../utils/getExportImageResamplingOptions';
import { translationNameSpace } from '../../constants';

// styles
import styles from './export-settings-panel.module.scss';

// types
import { ExportColorProfile, ExportFormat, ExportImageResampling, ExportQuality } from '../../enums';
import { TExportSetting } from '../../types';

export type TExportSettingsPanelProps = {
  onChange: TFunc<[TExportSetting]>;
  onClose: TFunc;
  setting: TExportSetting;
};

export const ExportSettingsPanel: FC<TExportSettingsPanelProps> = ({ onChange, onClose, setting }) => {
  const { t } = useTranslation();
  const colorProfileOptions = getExportColorProfileOptions((colorProfile) =>
    t(`${translationNameSpace}.settings.colorProfile.options.${colorProfile}`),
  );
  const imageResamplingOptions = getExportImageResamplingOptions((imageResampling) =>
    t(`${translationNameSpace}.settings.imageResampling.options.${imageResampling}`),
  );

  const qualityOptions = getExportQualityOptions((quality) => t(`${translationNameSpace}.settings.quality.options.${quality}`));

  return (
    <div className={styles.ExportSettingsPanel}>
      <div className={styles.ExportSettingsPanel__header}>
        <span className={styles.ExportSettingsPanel__title}>{t(`${translationNameSpace}.settings.title`)}</span>
        <div className={styles.ExportSettingsPanel__actions}>
          <Tooltip content={t('common.close')}>
            <UITools.ButtonIcon ariaLabel={t('common.close')} name="Close" onClick={onClose} />
          </Tooltip>
        </div>
      </div>
      <div className={styles.ExportSettingsPanel__body}>
        <EffectSettingsField controlWidth={100} label={t(`${translationNameSpace}.settings.labels.suffix`)}>
          <UITools.TextField
            aria-label={t(`${translationNameSpace}.settings.fields.suffix`)}
            className={styles.ExportSettingsPanel__input}
            defaultValue={setting.suffix}
            onBlur={(event): void => onChange({ ...setting, suffix: event.target.value })}
            placeholder={t(`${translationNameSpace}.settings.suffixPlaceholder`)}
            type="text"
          />
        </EffectSettingsField>
        <EffectSettingsField controlWidth={100} label={t(`${translationNameSpace}.settings.labels.colorProfile`)}>
          <UITools.Dropdown<ExportColorProfile>
            className={styles.ExportSettingsPanel__input}
            onSelect={(colorProfile): void => onChange({ ...setting, colorProfile })}
            options={colorProfileOptions}
            textAlign="left"
            value={setting.colorProfile}
            variant="outline"
          />
        </EffectSettingsField>
        {setting.format === ExportFormat.jpeg && (
          <EffectSettingsField controlWidth={100} label={t(`${translationNameSpace}.settings.labels.quality`)}>
            <UITools.Dropdown<ExportQuality>
              className={styles.ExportSettingsPanel__input}
              onSelect={(quality): void => onChange({ ...setting, quality })}
              options={qualityOptions}
              textAlign="left"
              value={setting.quality}
              variant="outline"
            />
          </EffectSettingsField>
        )}
        <EffectSettingsField controlWidth={100} label={t(`${translationNameSpace}.settings.labels.imageResampling`)}>
          <UITools.Dropdown<ExportImageResampling>
            className={styles.ExportSettingsPanel__input}
            onSelect={(imageResampling): void => onChange({ ...setting, imageResampling })}
            options={imageResamplingOptions}
            textAlign="left"
            value={setting.imageResampling}
            variant="outline"
          />
        </EffectSettingsField>
        <UITools.Checkbox
          label={t(`${translationNameSpace}.settings.labels.ignoreOverlappingLayers`)}
          onChange={(ignoreOverlappingLayers): void => onChange({ ...setting, ignoreOverlappingLayers })}
          value={setting.ignoreOverlappingLayers}
        />
      </div>
    </div>
  );
};

export default ExportSettingsPanel;
