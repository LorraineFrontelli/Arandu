/** Preparation must match the latest selection, not a stale async snapshot. */
export async function prepareLatest<T>(read: () => T, prepare: (value: T) => Promise<unknown>): Promise<T> {
  let prepared: T;
  do {
    prepared = read();
    await prepare(prepared);
  } while (prepared !== read());
  return prepared;
}
