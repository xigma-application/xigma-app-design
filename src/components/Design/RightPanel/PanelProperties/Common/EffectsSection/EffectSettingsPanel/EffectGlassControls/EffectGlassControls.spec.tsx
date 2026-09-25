import { ReactElement } from 'react';
import { render } from '@testing-library/react';

// components
import EffectGlassControls from './EffectGlassControls';
import { fieldProps } from 'test/FieldMock';

// others
import { MIXED_LABEL } from 'components/Design/RightPanel/PanelProperties/Common/constants';

// types
import { EffectType } from 'types/design/enums';
import { TEffect } from 'types/design/types';

// utils
import { createEffect } from 'utils/design/effects/createEffect';

const lightProps: Record<string, unknown>[] = [];
const numberProps: Record<string, unknown>[] = [];

vi.mock('shared', async (importOriginal) => {
  const original = await importOriginal<{ UITools: object }>();
  const { FieldMock } = await import('test/FieldMock');

  return { ...original, UITools: { ...original.UITools, Field: FieldMock } };
});
vi.mock('./EffectGlassLight/EffectGlassLight', () => ({
  default: (props: Record<string, unknown>): ReactElement => {
    lightProps.push(props);
    return <div />;
  },
}));
vi.mock('./EffectGlassNumberField/EffectGlassNumberField', () => ({
  default: (props: Record<string, unknown>): ReactElement => {
    numberProps.push(props);
    return <div />;
  },
}));

describe('EffectGlassControls behaviors', () => {
  it('should wire the light dial, the light fields and every glass slider to the effect patch', () => {
    // mock
    const onChange = vi.fn();
    const effect = createEffect(EffectType.glass);

    // before
    render(<EffectGlassControls effect={effect} mixedKeys={new Set<keyof TEffect>(['lightAngle', 'depth'])} onChange={onChange} />);

    // action
    (lightProps.at(-1)!.onChange as TFunc<[number]>)(30);
    (numberProps.at(-2)!.onChange as TFunc<[number]>)(40);
    (numberProps.at(-1)!.onChange as TFunc<[number]>)(50);
    fieldProps.slice(-5).forEach((props) => (props.onChange as TFunc<[number]>)(7));

    // result
    expect(onChange.mock.calls.map(([patch]) => patch)).toEqual([
      { lightAngle: 30 },
      { lightAngle: 40 },
      { lightIntensity: 50 },
      { refraction: 7 },
      { depth: 7 },
      { dispersion: 7 },
      { frost: 7 },
      { splay: 7 },
    ]);
    expect(numberProps.at(-2)?.displayValue).toBe(MIXED_LABEL);
    expect(numberProps.at(-1)?.displayValue).toBeUndefined();
    expect(fieldProps.at(-4)?.displayValue).toBe(MIXED_LABEL);
    expect(fieldProps.at(-5)?.displayValue).toBeUndefined();
  });

  it('should show Mixed only in the light intensity field when only it differs', () => {
    // before
    render(
      <EffectGlassControls
        effect={createEffect(EffectType.glass)}
        mixedKeys={new Set<keyof TEffect>(['lightIntensity'])}
        onChange={vi.fn()}
      />,
    );

    // result
    expect(numberProps.at(-2)?.displayValue).toBeUndefined();
    expect(numberProps.at(-1)?.displayValue).toBe(MIXED_LABEL);
  });
});
