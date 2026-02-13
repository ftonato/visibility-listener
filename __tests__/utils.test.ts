const {findPrefix, resetPrefixCache} = require('../src/utils');
const {JSDOM} = require('jsdom');

describe('findPrefix', () => {
  let mockDocument: Document;

  beforeEach(() => {
    // Reset the cache before each test
    resetPrefixCache();
    const dom = new JSDOM('<!DOCTYPE html>');
    mockDocument = dom.window.document;
  });

  it('should return an empty string when no prefix is available', () => {
    expect(findPrefix(mockDocument)).toBe('');
  });

  it('should return the correct prefix when available', () => {
    const availablePrefix = 'moz';
    (mockDocument as any)[availablePrefix + 'Hidden'] = 'value';

    expect(findPrefix(mockDocument)).toBe(availablePrefix);
  });

  it('should cache the prefix and return cached value on subsequent calls', () => {
    const availablePrefix = 'webkit';
    (mockDocument as any)[availablePrefix + 'Hidden'] = 'value';

    const firstCall = findPrefix(mockDocument);
    expect(firstCall).toBe(availablePrefix);

    // Remove the property to verify cache is used
    delete (mockDocument as any)[availablePrefix + 'Hidden'];
    
    const secondCall = findPrefix(mockDocument);
    expect(secondCall).toBe(availablePrefix); // Should still return cached value
  });
});
