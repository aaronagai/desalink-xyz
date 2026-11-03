// Each host sets data-lang="ms" on the Bahasa Malaysia homepage
export type Lang = 'en' | 'ms'
export const langOf = (host: HTMLElement | null): Lang => (host?.dataset.lang === 'ms' ? 'ms' : 'en')

// The Terminal demos follow the page's colour scheme (the phone stays light, as a real phone would)
export const pageTheme = (): 'light' | 'dark' =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
