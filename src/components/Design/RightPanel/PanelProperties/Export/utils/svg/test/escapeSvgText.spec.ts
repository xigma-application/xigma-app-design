// utils
import { escapeSvgText } from '../escapeSvgText';

describe('escapeSvgText', () => {
  it('should escape ampersands, and angle brackets', () => {
    expect(escapeSvgText('a & b < c > d')).toBe('a &amp; b &lt; c &gt; d');
  });

  it('should leave plain text untouched', () => {
    expect(escapeSvgText('Hello world')).toBe('Hello world');
  });

  it('should escape an ampersand before the tags it could otherwise start forming', () => {
    expect(escapeSvgText('<b>&amp;')).toBe('&lt;b&gt;&amp;amp;');
  });
});
