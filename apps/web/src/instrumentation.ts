// Node.js 22+ exposes a broken global localStorage (getItem is undefined
// without --localstorage-file). Libraries like next-themes call
// localStorage.getItem() and crash during SSR. Patch it with a no-op store.
export function register() {
  if (
    typeof globalThis.localStorage !== 'undefined' &&
    typeof globalThis.localStorage.getItem !== 'function'
  ) {
    const noop = () => null;
    globalThis.localStorage = {
      getItem: noop,
      setItem: noop,
      removeItem: noop,
      clear: noop,
      key: noop,
      length: 0,
    } as unknown as Storage;
  }
}
