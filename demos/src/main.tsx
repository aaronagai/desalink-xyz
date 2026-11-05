import { createRoot } from 'react-dom/client'
import type { ComponentType } from 'react'
import { DeployDemo } from './deploy-demo'
import { StormDemo } from './storm-demo'
import { TerminalDemo } from './terminal-demo'

// One bundle for every Stageshow demo on the page; each mounts into its host
// if the host is there (index.html loads this once the first is near view).
const DEMOS: [string, ComponentType][] = [
  ['stormDemo', StormDemo],
  ['terminalDemo', TerminalDemo],
  ['deployDemo', DeployDemo],
]
for (const [id, Demo] of DEMOS) {
  const host = document.getElementById(id)
  if (!host) continue
  host.classList.add('is-ready')
  createRoot(host).render(<Demo />)
}

// The interactive Terminal dashboard, opened from "View live demo"
import { TerminalApp } from './terminal/App'
let terminalRoot: ReturnType<typeof createRoot> | null = null
let opener: HTMLElement | null = null
function openTerminal() {
  if (terminalRoot) return
  opener = document.activeElement as HTMLElement | null
  const el = document.createElement('div')
  el.id = 'terminalApp'
  document.body.appendChild(el)
  document.documentElement.style.overflow = 'hidden'
  terminalRoot = createRoot(el)
  terminalRoot.render(
    <TerminalApp
      onClose={() => {
        terminalRoot?.unmount()
        terminalRoot = null
        el.remove()
        document.documentElement.style.overflow = ''
        opener?.focus({ preventScroll: true })
      }}
    />,
  )
}
const w = window as unknown as { __openTerminal?: () => void; __wantTerminal?: boolean }
w.__openTerminal = openTerminal
if (w.__wantTerminal) openTerminal()
