/**
 * Error codes used by the visibility listener
 */
export const ErrorCodes = {
  INVALID_GLOBALS: 'INVALID_GLOBALS',
} as const;

export type ErrorCode = (typeof ErrorCodes)[keyof typeof ErrorCodes];
