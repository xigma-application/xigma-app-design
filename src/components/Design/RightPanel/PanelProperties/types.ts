export type TFramePreset = {
  height: number;
  label: string;
  width: number;
};

export type TFramePresetGroup = {
  labelKey: string;
  presets: TFramePreset[];
};
