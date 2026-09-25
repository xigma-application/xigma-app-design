import { render, screen } from '@testing-library/react';

// components
import LayoutGuideAlignField from './LayoutGuideAlignField';
import { fieldProps } from 'test/FieldMock';

// others
import { MIXED_LABEL } from 'components/Design/RightPanel/PanelProperties/Common/constants';

vi.mock('shared', async (importOriginal) => {
  const original = await importOriginal<{ UITools: object }>();
  const { FieldMock } = await import('test/FieldMock');

  return { ...original, UITools: { ...original.UITools, Field: FieldMock } };
});

describe('LayoutGuideAlignField behaviors', () => {
  it('should pass the align options, value and handler to an outline dropdown field with a Mixed placeholder', () => {
    // mock
    const onSelect = vi.fn();
    const options = [{ label: 'Left', value: 'left' }];

    // before
    render(<LayoutGuideAlignField label="Type" onSelect={onSelect} options={options} value="left" />);

    // result
    expect(screen.getByText('Type')).toBeInTheDocument();
    expect(fieldProps.at(-1)).toMatchObject({ onSelect, options, placeholder: MIXED_LABEL, value: 'left', variant: 'outline' });
  });
});
