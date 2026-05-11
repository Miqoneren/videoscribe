/**
 * Type-safe Result<T, E> pattern for error handling
 * 
 * Inspired by Rust's Result type. Use instead of try/catch for cleaner flow.
 */

export type Result<T, E = Error> = 
  | { success: true; data: T; error?: never }
  | { success: false; data?: never; error: E };

/**
 * Create a successful Result
 */
export function ok<T>(data: T): Result<T, never> {
  return { success: true, data };
}

/**
 * Create a failed Result
 */
export function err<E = Error>(error: E): Result<never, E> {
  return { success: false, error };
}

/**
 * Unwrap a Result, throwing if it's an error
 */
export function unwrap<T, E extends Error = Error>(result: Result<T, E>): T {
  if (result.success) {
    return result.data;
  }
  throw result.error;
}

/**
 * Unwrap with a default value if error
 */
export function unwrapOr<T, E = Error>(result: Result<T, E>, defaultValue: T): T {
  return result.success ? result.data : defaultValue;
}

/**
 * Map the success value of a Result
 */
export function map<T, U, E = Error>(
  result: Result<T, E>,
  fn: (value: T) => U
): Result<U, E> {
  if (result.success) {
    return ok(fn(result.data));
  }
  return result;
}

/**
 * Map the error value of a Result
 */
export function mapErr<T, E, F = Error>(
  result: Result<T, E>,
  fn: (error: E) => F
): Result<T, F> {
  if (result.success) {
    return result;
  }
  return err(fn(result.error));
}

/**
 * Chain operations on a Result (flatMap)
 */
export function andThen<T, U, E = Error>(
  result: Result<T, E>,
  fn: (value: T) => Result<U, E>
): Result<U, E> {
  if (result.success) {
    return fn(result.data);
  }
  return result;
}

/**
 * Convert Promise<Result<T, E>> to Result<Promise<T>, E>
 * Useful for async operations that might fail
 */
export async function asyncMap<T, U, E = Error>(
  result: Result<T, E>,
  fn: (value: T) => Promise<U>
): Promise<Result<U, E>> {
  if (result.success) {
    try {
      const data = await fn(result.data);
      return ok(data);
    } catch (e) {
      return err(e as E);
    }
  }
  return result;
}

/**
 * Type guard to check if Result is successful
 */
export function isSuccess<T, E = Error>(result: Result<T, E>): result is { success: true; data: T } {
  return result.success;
}

/**
 * Type guard to check if Result is an error
 */
export function isError<T, E = Error>(result: Result<T, E>): result is { success: false; error: E } {
  return !result.success;
}
