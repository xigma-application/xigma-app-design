import { FC } from 'react';
import { useTranslation } from 'react-i18next';

// components
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
        <UITools.Field
          Component={UITools.TextField}
          aria-label={t(`${translationNameSpace}.settings.fields.suffix`)}
          controlWidth={100}
          defaultValue={setting.suffix}
          label={t(`${translationNameSpace}.settings.labels.suffix`)}
          onBlur={(event): void => onChange({ ...setting, suffix: event.target.value })}
          placeholder={t(`${translationNameSpace}.settings.suffixPlaceholder`)}
          type="text"
        />
        <UITools.Field
          Component={UITools.Dropdown<ExportColorProfile>}
          controlWidth={100}
          label={t(`${translationNameSpace}.settings.labels.colorProfile`)}
          onSelect={(colorProfile): void => onChange({ ...setting, colorProfile })}
          options={colorProfileOptions}
          textAlign="left"
          value={setting.colorProfile}
          variant="outline"
        />
        {(setting.format === ExportFormat.jpeg || setting.format === ExportFormat.pdf) && (
          <UITools.Field
            Component={UITools.Dropdown<ExportQuality>}
            controlWidth={100}
            label={t(`${translationNameSpace}.settings.labels.quality`)}
            onSelect={(quality): void => onChange({ ...setting, quality })}
            options={qualityOptions}
            textAlign="left"
            value={setting.quality}
            variant="outline"
          />
        )}
        <UITools.Field
          Component={UITools.Dropdown<ExportImageResampling>}
          controlWidth={100}
          label={t(`${translationNameSpace}.settings.labels.imageResampling`)}
          onSelect={(imageResampling): void => onChange({ ...setting, imageResampling })}
          options={imageResamplingOptions}
          textAlign="left"
          value={setting.imageResampling}
          variant="outline"
        />
        <UITools.Field
          Component={UITools.Checkbox}
          label={t(`${translationNameSpace}.settings.labels.ignoreOverlappingLayers`)}
          labelInside
          onChange={(ignoreOverlappingLayers): void => onChange({ ...setting, ignoreOverlappingLayers })}
          value={setting.ignoreOverlappingLayers}
        />
        <UITools.Field
          Component={UITools.Checkbox}
          label={t(`${translationNameSpace}.settings.labels.includeBoundingBox`)}
          labelInside
          onChange={(includeBoundingBox): void => onChange({ ...setting, includeBoundingBox })}
          value={setting.includeBoundingBox}
        />
        {(setting.format === ExportFormat.svg || setting.format === ExportFormat.pdf) && (
          <UITools.Field
            Component={UITools.Checkbox}
            label={t(`${translationNameSpace}.settings.labels.outlineText`)}
            labelInside
            onChange={(outlineText): void => onChange({ ...setting, outlineText })}
            value={setting.outlineText}
          />
        )}
        {setting.format === ExportFormat.svg && (
          <UITools.Field
            Component={UITools.Checkbox}
            label={t(`${translationNameSpace}.settings.labels.includeIdAttribute`)}
            labelInside
            onChange={(includeIdAttribute): void => onChange({ ...setting, includeIdAttribute })}
            value={setting.includeIdAttribute}
          />
        )}
      </div>
    </div>
  );
};

export default ExportSettingsPanel;
