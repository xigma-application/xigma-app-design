import { MemoryRouter, Route, Routes } from 'react-router';
import { ReactNode } from 'react';
import { renderHook } from '@testing-library/react';

// hooks
import { useCopyPageLink } from '../useCopyPageLink';

const writeText = vi.fn();

const wrapper = ({ children }: { children: ReactNode }): ReactNode => (
  <MemoryRouter initialEntries={['/design/file-123']}>
    <Routes>
      <Route element={<>{children}</>} path="/design/:id" />
    </Routes>
  </MemoryRouter>
);

describe('useCopyPageLink', () => {
  beforeEach(() => {
    writeText.mockClear();
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } });
  });

  it('should copy an origin-qualified link to the file with the page id as a query param', () => {
    // before
    const { result } = renderHook(() => useCopyPageLink('page-abc'), { wrapper });

    // action
    result.current();

    // result
    expect(writeText).toHaveBeenCalledWith(`${window.location.origin}/design/file-123?page=page-abc`);
  });
});
