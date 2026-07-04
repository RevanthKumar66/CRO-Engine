/**
 * Rejects a promise with an error if the wrapped task exceeds the specified time limit.
 *
 * @param promise The target task promise.
 * @param ms Limit boundary in milliseconds.
 * @param errorMessage Optional custom exception description.
 */
export function timeout<T>(
  promise: Promise<T>,
  ms: number,
  errorMessage: string = 'Operation timed out'
): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(errorMessage));
    }, ms);

    promise
      .then((res) => {
        clearTimeout(timer);
        resolve(res);
      })
      .catch((err) => {
        clearTimeout(timer);
        reject(err);
      });
  });
}
