export type InteractionFailureKind =
  | 'crash'
  | 'timeout'
  | 'tier'
  | 'docker'
  | 'unsupported'
  | 'launch'
  | 'unknown';

/** Failures that should fail the interaction stage exit code. */
export function isHardInteractionFailure(kind: InteractionFailureKind): boolean {
  return kind === 'crash' || kind === 'timeout' || kind === 'launch' || kind === 'docker';
}

export function classifyInteractionFailure(options: {
  tierMismatch?: boolean;
  dockerFailed?: boolean;
  error?: string;
}): InteractionFailureKind | undefined {
  if (options.tierMismatch) return 'tier';
  if (options.dockerFailed) return 'docker';
  const err = options.error ?? '';
  if (!err) return undefined;
  if (/timeout|timed out/i.test(err)) return 'timeout';
  if (
    /browser has been closed|gpu process|context.?lost|target page.*closed|network service crashed/i.test(
      err,
    )
  ) {
    return 'crash';
  }
  if (/mouse wheel is not supported/i.test(err)) return 'unsupported';
  if (/executable doesn't exist|browserType\.launch/i.test(err)) return 'launch';
  if (/docker run failed|ERR_MODULE_NOT_FOUND/i.test(err)) return 'docker';
  return 'unknown';
}

export function profileResultFailed(
  kind: InteractionFailureKind | undefined,
  hadError: boolean,
): boolean {
  if (kind === 'tier' || kind === 'unsupported') return false;
  if (!hadError) return false;
  if (kind) return isHardInteractionFailure(kind) || kind === 'unknown';
  return true;
}

export function interactionHasHardFailures(
  profiles: Array<{ failureKind?: InteractionFailureKind; failed?: boolean }>,
): boolean {
  return profiles.some((p) => profileResultFailed(p.failureKind, p.failed === true));
}
