const {findPrefix} = require('../src/utils');
const {JSDOM} = require('jsdom');

describe('findPrefix', () => {
  let mockDocument: Document;

  beforeEach(() => {
    const dom = new JSDOM('<!DOCTYPE html>');
    mockDocument = dom.window.document;
  });

  it('should return the correct prefix when available', () => {
    const availablePrefix = 'moz';
    (mockDocument as any)[availablePrefix + 'Hidden'] = 'value';

    expect(findPrefix(mockDocument)).toBe(availablePrefix);
  });

  it('should return an empty string when no prefix is available', () => {
    expect(findPrefix(mockDocument)).toBe('');
  });
});
