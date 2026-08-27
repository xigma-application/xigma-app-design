import { ReactNode } from 'react';

// components
import ChannelFields from '../ChannelFields/ChannelFields';
import CssField from '../CssField/CssField';
import HexField from '../HexField/HexField';

// others
import { HSB_CHANNELS, HSL_CHANNELS, RGB_CHANNELS } from '../constants';

// types
import { ColorFormat } from '../enums';
import { TRgb } from 'types/color';
import { TUseColorModelResult } from '../../../../hooks/useColorModel';

// utils
import { rgbToCssString } from 'utils/color/rgbToCssString';
import { rgbToHex } from 'utils/color/rgbToHex';
import { hslToRgb } from '../../../../utils/hslToRgb';
import { rgbToHsl } from '../../../../utils/rgbToHsl';

export const renderValueField = (format: ColorFormat, alpha: number, colorModel: TUseColorModelResult, rgb: TRgb): ReactNode => {
  switch (format) {
    case ColorFormat.hex:
      return <HexField hex={colorModel.hex} onCommit={colorModel.setHex} />;
    case ColorFormat.rgb:
      return (
        <ChannelFields
          channels={RGB_CHANNELS}
          onCommit={(next) => colorModel.setHex(rgbToHex({ b: next.b, g: next.g, r: next.r }))}
          values={rgb}
        />
      );
    case ColorFormat.css:
      return <CssField onCommit={colorModel.setPreset} value={rgbToCssString({ ...rgb, a: alpha })} />;
    case ColorFormat.hsl:
      return (
        <ChannelFields
          channels={HSL_CHANNELS}
          onCommit={(next) => colorModel.setHex(rgbToHex(hslToRgb({ h: next.h, l: next.l, s: next.s })))}
          values={rgbToHsl(rgb)}
        />
      );
    default:
      return (
        <ChannelFields
          channels={HSB_CHANNELS}
          onCommit={(next) => colorModel.setHsv({ h: next.h, s: next.s, v: next.v })}
          values={colorModel.hsv}
        />
      );
  }
};
