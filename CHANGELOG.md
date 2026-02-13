# visibility-listener

## 1.1.0

### Minor Changes

- Add `destroy()` method for proper cleanup and memory leak prevention
- Fix event listener capture flag mismatch (listeners now correctly removed on pause)
- Read initial visibility state from document instead of defaulting to 'visible'
- Add `ErrorCodes` export and global prefix caching for performance
- Improve documentation (README, EXAMPLES.md), strict equality, JSDoc, and test coverage
- Remove debug console statements from production code
