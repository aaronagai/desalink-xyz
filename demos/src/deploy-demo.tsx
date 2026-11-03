import { createRoot } from 'react-dom/client'
import { Stage } from './kit/stage'
import { Phone } from './kit/phone'
import { Thread, Bubble, Stamp, Receipt } from './kit/messages'
import type { Act } from './kit/act'
import './deploy-demo.css'

// "Deployed fast", told as the message thread a customer has
// with Desalink: the order is confirmed on Monday, the technician is on the
// way on Tuesday morning, Starlink is online by early afternoon, and the
// customer replies with their speed. The timestamps carry the claim
// (24–48h to site, 2–4h to install); the customer's reply is the payoff.

type S = {
  day2: boolean
  typing1: boolean
  day3: boolean
  typing2: boolean
  draft: string
  sent: boolean
  delivered: boolean
  read: boolean
}

const initial: S = { day2: false, typing1: false, day3: false, typing2: false, draft: '', sent: false, delivered: false, read: false }
// Reduced motion, thumbnails and screenshots: the finished conversation
const poster: S = { ...initial, day2: true, day3: true, sent: true, delivered: true, read: true }

// The host sets data-lang="ms" on the Bahasa Malaysia homepage
const COPY = {
  en: {
    mon: 'Mon 9:12 AM',
    hello: 'Hello Desalink!',
    ask: 'Hi! Can you install Starlink at our longhouse in Long Lama?',
    confirmed: 'Yes we can. Your order is confirmed, Jimmy will be with you tomorrow morning.',
    tue1: 'Tue 10:30 AM',
    onTheWay: 'Jimmy is on the way, about 20 minutes out.',
    tue2: 'Tue 1:05 PM',
    done: 'All done. Your Starlink is online.',
    mine: 'Wah, 180 Mbps! Terima kasih',
    delivered: 'Delivered',
    read: 'Read 1:07 PM',
    placeholder: 'Message',
  },
  ms: {
    mon: 'Isn 9:12 PG',
    hello: 'Helo Desalink!',
    ask: 'Hai! Boleh pasang Starlink di rumah panjang kami di Long Lama?',
    confirmed: 'Boleh. Tempahan anda sudah disahkan, Jimmy akan datang esok pagi.',
    tue1: 'Sel 10:30 PG',
    onTheWay: 'Jimmy dalam perjalanan, lebih kurang 20 minit lagi.',
    tue2: 'Sel 1:05 PTG',
    done: 'Siap. Starlink anda sudah dalam talian.',
    mine: 'Wah, 180 Mbps! Terima kasih',
    delivered: 'Dihantar',
    read: 'Dibaca 1:07 PTG',
    placeholder: 'Mesej',
  },
}
const host = document.getElementById('deployDemo')
const T = COPY[host?.dataset.lang === 'ms' ? 'ms' : 'en']

async function script(a: Act<S>) {
  await a.wait(900)
  // Next morning: the technician is on the way
  await a.set({ day2: true, typing1: true })
  await a.wait(1300)
  await a.set({ typing1: false })
  await a.wait(1700)
  // Early afternoon: installed and online
  await a.set({ day3: true, typing2: true })
  await a.wait(1300)
  await a.set({ typing2: false })
  await a.wait(1200)
  // The customer answers with the result
  await a.click('compose')
  await a.type('draft', T.mine, { interval: 55 })
  await a.wait(350)
  await a.click('send')
  await a.set({ sent: true, draft: '' })
  await a.wait(700)
  await a.set({ delivered: true })
  await a.wait(900)
  await a.set({ read: true })
  await a.wait(2400)
}

function ArrowUp() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden>
      <path d="M8 13V3.5M3.5 7.5 8 3l4.5 4.5" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function DeployDemo() {
  return (
    <Stage
      width={496}
      height={496}
      compact={{ below: 460, width: 342, height: 400 }}
      initial={initial}
      poster={poster}
      script={script}
      play="once"
      cursor={{ at: 'compose', style: 'touch' }}
      className="dd"
    >
      {(s, _rect, layout) => (
        <Phone width={layout === "compact" ? 310 : 448} className="dd-phone">
          <Thread className="dd-thread">
            <Stamp>{T.mon}</Stamp>
            <Bubble from="me">{T.hello}</Bubble>
            <Bubble from="me">{T.ask}</Bubble>
            <Bubble from="them">{T.confirmed}</Bubble>
            {s.day2 && <Stamp className="dd-stamp-new">{T.tue1}</Stamp>}
            {s.day2 && (
              <Bubble from="them" typing={s.typing1}>
                {T.onTheWay}
              </Bubble>
            )}
            {s.day3 && <Stamp className="dd-stamp-new">{T.tue2}</Stamp>}
            {s.day3 && (
              <Bubble from="them" typing={s.typing2}>
                {T.done}
              </Bubble>
            )}
            {s.sent && (
              <Bubble from="me" source="draft">
                {T.mine}
              </Bubble>
            )}
            <Receipt show={s.delivered}>{s.read ? T.read : T.delivered}</Receipt>
          </Thread>
          <div className="dd-compose">
            <span className="dd-plus" aria-hidden>
              <svg width="16" height="16" viewBox="0 0 16 16">
                <path d="M8 2.5v11M2.5 8h11" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </span>
            <span className="dd-field" data-target="compose">
              <span className="dd-field__text" data-target="draft">
                {s.draft}
                {s.draft && <i className="dd-caret" data-snap />}
              </span>
              <span className="dd-field__ph" data-hide={s.draft ? '' : undefined}>
                {T.placeholder}
              </span>
              <span className="dd-send" data-target="send" data-show={s.draft ? '' : undefined}>
                <ArrowUp />
              </span>
            </span>
          </div>
        </Phone>
      )}
    </Stage>
  )
}

if (host) {
  host.classList.add('is-ready')
  createRoot(host).render(<DeployDemo />)
}
