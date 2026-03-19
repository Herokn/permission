export function useTheme() {
  const setTheme = (name: string) => {
    if (typeof document !== 'undefined') document.documentElement.setAttribute('data-theme', name)
  }
  return { setTheme }
}
