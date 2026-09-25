import { ReactElement, ReactNode } from 'react';
import { render, screen } from '@testing-library/react';

// components
import ExportPreview from './ExportPreview';

const previewMock = vi.fn();

vi.mock('../hooks/useExportPreview', () => ({ useExportPreview: (...args: unknown[]): unknown => previewMock(...args) }));
vi.mock('shared', async (importOriginal) => {
  const original = await importOriginal<{ UITools: object }>();

  return {
    ...original,
    UITools: {
      ...original.UITools,
      Accordion: ({ items }: { items: { content: ReactNode; label: string }[] }): ReactElement => (
        <div>
          {items[0].label}
          {items[0].content}
        </div>
      ),
    },
  };
});

describe('ExportPreview behaviors', () => {
  it('should show the rendered preview of the exported layer', () => {
    // mock
    previewMock.mockReturnValue('data:image/png;base64,abc');

    // before
    const { container } = render(<ExportPreview nodeId="n" />);

    // result
    expect(previewMock).toHaveBeenCalledWith('n');
    expect(screen.getByText('Preview')).toBeInTheDocument();
    expect((container.querySelector('[style]') as HTMLElement).style.backgroundImage).toContain('data:image/png;base64,abc');
  });

  it('should show an empty preview while nothing is rendered yet', () => {
    // mock
    previewMock.mockReturnValue(null);

    // before
    const { container } = render(<ExportPreview nodeId={null} />);

    // result
    expect(container.querySelector('[style]')).toBeNull();
  });
});
