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
