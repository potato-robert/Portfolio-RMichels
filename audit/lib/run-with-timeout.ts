export class JobTimeoutError extends Error {
  override name = 'JobTimeoutError';

  constructor(
    readonly label: string,
    readonly timeoutMs: number,
    readonly lastStep?: string,
  ) {
    super(
      lastStep
        ? `Job timed out after ${timeoutMs}ms: ${label} (last step: ${lastStep})`
        : `Job timed out after ${timeoutMs}ms: ${label}`,
    );
  }
}

export async function runWithTimeout<T>(
  label: string,
  ms: number,
  getLastStep: () => string | undefined,
  fn: () => Promise<T>,
): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      reject(new JobTimeoutError(label, ms, getLastStep()));
    }, ms);
  });
  try {
    return await Promise.race([fn(), timeoutPromise]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}
