import { MemoryRouter } from 'react-router';
import { render } from '@testing-library/react';

// components
import Title from './Title';

describe('Title behaviors', () => {
  it('should set the document title for a matched route', () => {
    // before
    render(
      <MemoryRouter initialEntries={['/']}>
        <Title />
      </MemoryRouter>,
    );

    // result
    expect(document.title).toBe('Home - xigma');
  });

  it('should fall back to the not-found title for an unmatched route', () => {
    // before
    render(
      <MemoryRouter initialEntries={['/this-route-does-not-exist']}>
        <Title />
      </MemoryRouter>,
    );

    // result
    expect(document.title).toBe('404 - xigma');
  });
});
