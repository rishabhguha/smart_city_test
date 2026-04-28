import { auth } from '@clerk/nextjs/server';
import { AuthRedirectClient } from './AuthRedirectClient';
import { SignInButton, SignUpButton } from '@clerk/nextjs';
import { Instrument_Serif, JetBrains_Mono } from 'next/font/google';
import s from './landing.module.css';

const serif = Instrument_Serif({
  subsets: ['latin'],
  weight: '400',
  style: ['normal', 'italic'],
  variable: '--font-landing-serif',
  display: 'swap',
});

const mono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-landing-mono',
  display: 'swap',
});

export default async function Home() {
  const { userId } = await auth();

  if (userId) {
    return <AuthRedirectClient />;
  }

  return (
    <div className={`${s.landing} ${serif.variable} ${mono.variable}`}>
      {/* NAV */}
      <nav className={s.nav}>
        <div className={`${s.wrap} ${s.navRow}`}>
          <div className={s.brand}>
            <span className={s.brandMark} />
            <span>Smart 311</span>
            <small className={s.brandSmall}>/ civic</small>
          </div>
          <div className={s.navLinks}>
            <a href='#how' className={s.navLink}>How it works</a>
            <a href='#board' className={s.navLink}>Live board</a>
          </div>
          <div className={s.navCta}>
            <SignInButton>
              <button className={`${s.btn} ${s.btnGhost}`}>Sign in</button>
            </SignInButton>
            <SignUpButton>
              <button className={`${s.btn} ${s.btnDark}`}>Sign up</button>
            </SignUpButton>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <header className={s.hero}>
        <div className={`${s.wrap} ${s.heroGrid}`}>
          <div>
            <span className={s.eyebrow}>
              <span className={s.eyebrowDot} />
              All systems operational · 311 routing live
            </span>
            <h1 className={s.headline}>
              Report it once.<br />
              <span className={s.ser}>We&apos;ll route it</span> to the right desk.
            </h1>
            <p className={s.lede}>
              Smart 311 is the non-emergency channel between residents and city departments. Submit a request, follow it through every status change, and stay in the loop on outages, closures, and neighborhood updates — without the phone tree.
            </p>
            <div className={s.heroActions}>
              <SignUpButton>
                <button className={`${s.btn} ${s.btnDark}`}>
                  Submit a request
                  <svg width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
                    <path d='M5 12h14m-6-6 6 6-6 6' />
                  </svg>
                </button>
              </SignUpButton>
              <a href='#board' className={`${s.btn} ${s.btnOutline}`}>See live activity</a>
            </div>
            <div className={s.metaRow}>
              <span><strong>4.2 min</strong> median time to acknowledge</span>
              <span className={s.metaDivider} />
              <span><strong>27</strong> departments connected</span>
              <span className={s.metaDivider} />
              <span><strong>Web · SMS</strong></span>
            </div>
          </div>

          {/* Console */}
          <div className={s.console} aria-label='Sample request console'>
            <div className={s.consoleHead}>
              <div className={s.consoleTitle}>
                My requests{' '}
                <span className={`${s.mono} ${s.consoleTitleMeta}`}>· 3 active</span>
              </div>
              <div className={s.consoleTabs}>
                <span className={`${s.tab} ${s.tabActive}`}>Active</span>
                <span className={s.tab}>Resolved</span>
                <span className={s.tab}>Nearby</span>
              </div>
            </div>

            <div className={s.ticketList}>
              <div className={s.ticket}>
                <div className={s.tkIcon}>
                  <svg width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
                    <circle cx='12' cy='12' r='9' /><path d='M12 7v5l3 2' />
                  </svg>
                </div>
                <div>
                  <div className={s.tkTitle}>Pothole — corner of Hayes &amp; Webster</div>
                  <div className={`${s.tkMeta} ${s.mono}`}>#SR-48201 · Public Works · opened 2h ago</div>
                </div>
                <span className={`${s.pill} ${s.pillRouted}`}>
                  <span className={s.pillDot} />Routed
                </span>
              </div>

              <div className={s.ticket}>
                <div className={s.tkIcon}>
                  <svg width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
                    <path d='M3 12h18M3 6h18M3 18h18' />
                  </svg>
                </div>
                <div>
                  <div className={s.tkTitle}>Streetlight out — 1421 Filmore Ave</div>
                  <div className={`${s.tkMeta} ${s.mono}`}>#SR-48189 · DPW Lighting · crew dispatched</div>
                </div>
                <span className={`${s.pill} ${s.pillProgress}`}>
                  <span className={s.pillDot} />In progress
                </span>
              </div>

              <div className={s.ticket}>
                <div className={s.tkIcon}>
                  <svg width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
                    <path d='M3 7h18M6 7v13a2 2 0 002 2h8a2 2 0 002-2V7M9 7V4h6v3' />
                  </svg>
                </div>
                <div>
                  <div className={s.tkTitle}>Missed bulk pickup — 88 Linden St</div>
                  <div className={`${s.tkMeta} ${s.mono}`}>#SR-48144 · Sanitation · ETA tomorrow 8a</div>
                </div>
                <span className={`${s.pill} ${s.pillReceived}`}>
                  <span className={s.pillDot} />Received
                </span>
              </div>
            </div>

            <div className={s.consoleFoot}>
              <span className={s.live}>
                <span className={s.liveDot} />Live updates · pulled 12s ago
              </span>
              <span className={s.mono}>view all →</span>
            </div>
          </div>
        </div>
      </header>

      {/* TICKER */}
      <div className={s.ticker} aria-hidden='true'>
        <div className={s.tickerRow}>
          {[
            '14:02 · Water main repair on 9th Ave — restored',
            '13:48 · Tree removal scheduled, Lincoln Park, Thu',
            '13:31 · Route 22 detour during paving, expect 8 min delay',
            '13:10 · Recycling pickup back on schedule borough-wide',
            '12:52 · Pothole reports up 18% post-thaw, crews added',
            '14:02 · Water main repair on 9th Ave — restored',
            '13:48 · Tree removal scheduled, Lincoln Park, Thu',
            '13:31 · Route 22 detour during paving, expect 8 min delay',
            '13:10 · Recycling pickup back on schedule borough-wide',
            '12:52 · Pothole reports up 18% post-thaw, crews added',
          ].map((text, i) => {
            const [time, ...rest] = text.split(' · ');
            return (
              <span key={i} className={s.tickerItem}>
                <span className={s.mono}>{time}</span> · {rest.join(' · ')}{' '}
                <span className={s.tickerSep}>·</span>
              </span>
            );
          })}
        </div>
      </div>

      {/* HOW IT WORKS */}
      <section id='how' className={s.section}>
        <div className={s.wrap}>
          <div className={s.secHead}>
            <div>
              <div className={`${s.secLabel} ${s.mono}`}>/ 01 — How it works</div>
              <h2 className={s.secTitle}>
                Three taps from <span className={s.ser}>&ldquo;that&rsquo;s broken&rdquo;</span> to a tracked ticket.
              </h2>
            </div>
            <p className={s.secSub}>
              Every request gets a permanent ID, a department owner, and an SLA — visible to you the whole way.
            </p>
          </div>
          <div className={s.steps}>
            <div className={s.step}>
              <div className={`${s.stepTag} ${s.mono}`}>i.</div>
              <div className={`${s.stepNum} ${s.ser}`}>01</div>
              <h3 className={s.stepH3}>Snap &amp; describe</h3>
              <p className={s.stepP}>Tap the category, drop a photo, confirm the location. We&apos;ll detect duplicates so a single block doesn&apos;t generate forty tickets.</p>
            </div>
            <div className={s.step}>
              <div className={`${s.stepTag} ${s.mono}`}>ii.</div>
              <div className={`${s.stepNum} ${s.ser}`}>02</div>
              <h3 className={s.stepH3}>Auto-routed</h3>
              <p className={s.stepP}>The right department picks it up — Public Works, Sanitation, Parks, DPW Lighting, Animal Services. No more dialed-and-dropped calls.</p>
            </div>
            <div className={s.step}>
              <div className={`${s.stepTag} ${s.mono}`}>iii.</div>
              <div className={`${s.stepNum} ${s.ser}`}>03</div>
              <h3 className={s.stepH3}>Tracked end-to-end</h3>
              <p className={s.stepP}>You get notifications at every status change — received, scheduled, on-site, resolved — with a map pin and crew note.</p>
            </div>
          </div>
        </div>
      </section>

      {/* LIVE BOARD */}
      <section id='board' className={s.section}>
        <div className={s.wrap}>
          <div className={s.secHead}>
            <div>
              <div className={`${s.secLabel} ${s.mono}`}>/ 02 — Live activity</div>
              <h2 className={s.secTitle}>
                A transparent <span className={s.ser}>window</span> into your city.
              </h2>
            </div>
            <p className={s.secSub}>
              Open by default. Anyone can see what&apos;s been reported, what&apos;s been resolved, and where the work is happening — right now.
            </p>
          </div>
          <div className={s.board}>
            <div className={s.mapCard}>
              <div className={s.mapStreets} />
              <span className={s.mapPin} style={{ left: '22%', top: '38%' }} />
              <span className={s.mapTag} style={{ left: '22%', top: '38%' }}>Pothole · 11m ago</span>
              <span className={`${s.mapPin} ${s.mapPinWarn}`} style={{ left: '41%', top: '28%' }} />
              <span className={`${s.mapPin} ${s.mapPinGood}`} style={{ left: '58%', top: '52%' }} />
              <span className={s.mapPin} style={{ left: '67%', top: '33%' }} />
              <span className={`${s.mapPin} ${s.mapPinHot}`} style={{ left: '73%', top: '64%' }} />
              <span className={s.mapTag} style={{ left: '73%', top: '64%' }}>Water main · crew on-site</span>
              <span className={s.mapPin} style={{ left: '35%', top: '71%' }} />
              <span className={`${s.mapPin} ${s.mapPinGood}`} style={{ left: '84%', top: '44%' }} />
              <span className={`${s.mapPin} ${s.mapPinWarn}`} style={{ left: '50%', top: '60%' }} />
              <div className={`${s.mapCorner} ${s.mono}`}>[ map placeholder · drop in OSM tiles ]</div>
              <div className={s.mapLegend}>
                <div className={`${s.lgRow} ${s.mono}`}><span className={s.lgDot} style={{ background: 'var(--accent)' }} />routed</div>
                <div className={`${s.lgRow} ${s.mono}`}><span className={s.lgDot} style={{ background: 'var(--warn)' }} />in progress</div>
                <div className={`${s.lgRow} ${s.mono}`}><span className={s.lgDot} style={{ background: 'var(--hot)' }} />crew on-site</div>
                <div className={`${s.lgRow} ${s.mono}`}><span className={s.lgDot} style={{ background: 'var(--good)' }} />resolved</div>
              </div>
            </div>

            <div>
              <div className={s.stats}>
                <div className={s.stat}>
                  <div className={s.statNum}>12,418</div>
                  <div className={`${s.statLabel} ${s.mono}`}>REQUESTS THIS MONTH</div>
                  <div className={s.statTrend}>↑ 8.2% vs last month</div>
                </div>
                <div className={s.stat}>
                  <div className={s.statNum}>94<span className={s.ser}>%</span></div>
                  <div className={`${s.statLabel} ${s.mono}`}>RESOLVED ON-SLA</div>
                  <div className={s.statTrend}>↑ 2.1 pts</div>
                </div>
                <div className={s.stat}>
                  <div className={s.statNum}>2.6 <span className={s.statNumSmall}>days</span></div>
                  <div className={`${s.statLabel} ${s.mono}`}>MEDIAN RESOLUTION</div>
                  <div className={`${s.statTrend} ${s.statTrendDown}`}>— flat</div>
                </div>
                <div className={s.stat}>
                  <div className={s.statNum}>27</div>
                  <div className={`${s.statLabel} ${s.mono}`}>DEPARTMENTS CONNECTED</div>
                  <div className={`${s.statTrend} ${s.statTrendDown}`}>+ 3 this quarter</div>
                </div>
              </div>

              <div className={s.feedCard}>
                <div className={s.feedHead}>
                  <span>Recent activity</span>
                  <span className={`${s.mono} ${s.feedHeadMeta}`}>auto-refreshes</span>
                </div>
                {[
                  { time: '14:02', title: 'Pothole filled · 4th & Hayes', sub: 'Resolved by Public Works · #SR-48127 · 1.4 days end-to-end' },
                  { time: '13:51', title: 'Graffiti removed · Mission Skate Park', sub: 'Resolved by Parks & Rec · #SR-48119 · 6h end-to-end' },
                  { time: '13:33', title: 'Streetlight crew dispatched · Filmore Ave', sub: 'In progress · DPW Lighting · #SR-48189 · ETA 1h' },
                  { time: '13:10', title: 'Recycling pickup completed', sub: 'Sanitation · borough-wide route Tuesday-A' },
                ].map(({ time, title, sub }) => (
                  <div key={time + title} className={s.feedItem}>
                    <span className={`${s.feedTime} ${s.mono}`}>{time}</span>
                    <div>
                      <div className={s.ftTitle}>{title}</div>
                      <div className={s.ftSub}>{sub}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className={s.ctaSection}>
        <div className={s.wrap}>
          <div className={s.ctaBand}>
            <div>
              <h2 className={s.ctaTitle}>
                Your city, <span className={s.ser}>on the record.</span>
              </h2>
              <p className={s.ctaP}>
                One inbox for every non-emergency request. One feed for every change on your block. Free for residents — supported by your municipality.
              </p>
            </div>
            <div className={s.ctaActions}>
              <SignUpButton>
                <button className={`${s.btn} ${s.btnLight}`}>Get started free</button>
              </SignUpButton>
              <SignInButton>
                <button className={`${s.btn} ${s.btnLine}`}>Sign in to your account</button>
              </SignInButton>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className={s.footer}>
        <div className={s.wrap}>
          <div className={s.footGrid}>
            <div>
              <div className={s.brand}>
                <span className={s.brandMark} />
                <span>Smart 311</span>
                <small className={s.brandSmall}>/ civic</small>
              </div>
              <p className={s.footTag}>
                A non-emergency request and notification platform connecting residents to their city&apos;s departments.
              </p>
            </div>
            <div>
              <h5 className={s.footColH5}>Product</h5>
              <a href='#how' className={s.footLink}>How it works</a>
              <a href='#board' className={s.footLink}>Live activity</a>
            </div>
            <div>
              <h5 className={s.footColH5}>For cities</h5>
              <a href='#' className={s.footLink}>Department dashboard</a>
              <a href='#' className={s.footLink}>Routing &amp; SLAs</a>
              <a href='#' className={s.footLink}>Open data &amp; API</a>
            </div>
            <div>
              <h5 className={s.footColH5}>Resources</h5>
              <a href='#' className={s.footLink}>Help center</a>
              <a href='#' className={s.footLink}>Accessibility</a>
              <a href='#' className={s.footLink}>Contact 311</a>
            </div>
            <div>
              <h5 className={s.footColH5}>Legal</h5>
              <a href='#' className={s.footLink}>Privacy</a>
              <a href='#' className={s.footLink}>Terms</a>
            </div>
          </div>
          <div className={`${s.footBottom} ${s.mono}`}>
            <span>© 2026 SMART 311</span>
            <span>v1.0 · STATUS: OPERATIONAL</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
