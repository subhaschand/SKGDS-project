/**
 * Standardized error handling utilities for the SKGDP frontend.
 */

// Error types that can be thrown
export interface ApiError {
  status: number;
  error: string;
  message: string;
  timestamp?: string;
}

/**
 * Custom error class for API errors
 */
export class ApiRequestError extends Error {
  status: number;
  errorType: string;

  constructor(status: number, errorType: string, message: string) {
    super(message);
    this.name = 'ApiRequestError';
    this.status = status;
    this.errorType = errorType;
  }
}

/**
 * Parse error response from API
 */
export const parseApiError = async (response: Response): Promise<ApiError> => {
  try {
    const data = await response.json();
    return {
      status: data.status || response.status,
      error: data.error || 'Error',
      message: data.message || 'An error occurred',
      timestamp: data.timestamp
    };
  } catch {
    return {
      status: response.status,
      error: 'Request Failed',
      message: response.statusText || 'Network error occurred'
    };
  }
};

/**
 * Get user-friendly error message based on status code
 */
export const getErrorMessage = (status: number): string => {
  switch (status) {
    case 400:
      return 'Invalid request. Please check your input.';
    case 401:
      return 'Please log in to continue.';
    case 403:
      return 'You do not have permission to perform this action.';
    case 404:
      return 'The requested resource was not found.';
    case 409:
      return 'A conflict occurred. The data may have been modified.';
    case 413:
      return 'The file is too large. Please upload a smaller file.';
    case 429:
      return 'Too many requests. Please wait a moment and try again.';
    case 500:
      return 'Server error. Please try again later.';
    case 502:
    case 503:
    case 504:
      return 'Service temporarily unavailable. Please try again later.';
    default:
      return 'An unexpected error occurred. Please try again.';
  }
};

/**
 * Handle async operations with error handling
 */
export const withErrorHandling = async <T>(
  operation: () => Promise<T>,
  onError?: (error: Error) => void
): Promise<T | null> => {
  try {
    return await operation();
  } catch (error) {
    console.error('Operation failed:', error);
    if (onError && error instanceof Error) {
      onError(error);
    }
    return null;
  }
};

/**
 * Retry an operation with exponential backoff
 */
export const retryWithBackoff = async <T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> => {
  let lastError: Error;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      
      // Don't retry on certain error types
      if (error instanceof ApiRequestError) {
        if ([400, 401, 403, 404].includes(error.status)) {
          throw error;
        }
      }
      
      // Wait before retrying with exponential backoff
      if (attempt < maxRetries - 1) {
        const delay = baseDelay * Math.pow(2, attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError!;
};

/**
 * Check if error is a network error
 */
export const isNetworkError = (error: Error): boolean => {
  return (
    error.message.includes('Failed to fetch') ||
    error.message.includes('NetworkError') ||
    error.message.includes('Network request failed')
  );
};

/**
 * Check if error is an authentication error
 */
export const isAuthError = (error: Error): boolean => {
  if (error instanceof ApiRequestError) {
    return error.status === 401 || error.status === 403;
  }
  return false;
};
