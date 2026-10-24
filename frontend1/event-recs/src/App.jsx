import { useEffect, useMemo, useState } from 'react';
import { getFilters, getRecommendations } from './api.js';
import RegisterModal from './RegisterModal.jsx';
import React from 'react'

const DATES = [['all', 'Any time'], ['week', 'This week'], ['month', 'This month'], ['quarter', '3 months']];
const FORMATS = [['', 'Any'], ['online', 'Online'], ['in-person', 'In person']];
const INTEREST_RE = /^[\w .+#/-]+$/;
const CARD = 'rounded-2xl border border-sand-deep/70 bg-cream shadow-[0_18px_40px_-26px_rgba(107,20,40,.55)]';
const BTN = 'rounded-xl bg-maroon px-4 py-2 font-semibold text-cream transition hover:bg-maroon-dark';

const fmtDate = (iso) => new Date(iso).toLocaleString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' });

function Segmented({ label, value, onChange, options }) {
  return (
    <fieldset>
      <legend className="mb-1.5 text-sm font-semibold">{label}</legend>
      <div className="flex flex-wrap gap-1 rounded-xl bg-sand p-1">
        {options.map(([v, text]) => (
          <button key={v} type="button" aria-pressed={value === v} onClick={() => onChange(v)}
            className={`flex-1 rounded-lg px-2.5 py-1.5 text-sm font-medium transition ${value === v ? 'bg-maroon text-cream shadow-sm' : 'text-ink/65 hover:text-maroon'}`}>{text}</button>
        ))}
      </div>
    </fieldset>
  );
}

function Select({ label, value, onChange, options, any }) {
  return (
    <label className="block text-sm font-semibold">{label}
      <select value={value} onChange={(e) => onChange(e.target.value)}
        className="mt-1.5 w-full rounded-xl border border-sand-deep bg-white px-3 py-2 text-sm font-normal">
        <option value="">{any}</option>
        {options.map((o) => <option key={o}>{o}</option>)}
      </select>
    </label>
  );
}

function MatchRing({ pct }) {
  const r = 24, c = 2 * Math.PI * r;
  return (
    <div className="relative grid size-16 shrink-0 place-items-center rounded-full bg-sand" role="img" aria-label={`${pct}% match`}>
      <svg viewBox="0 0 60 60" className="absolute size-16 -rotate-90">
        <circle cx="30" cy="30" r={r} fill="none" stroke="#e4d0ac" strokeWidth="5" />
        <circle cx="30" cy="30" r={r} fill="none" stroke="#6b1428" strokeWidth="5" strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c * (1 - pct / 100)} style={{ transition: 'stroke-dashoffset .8s ease' }} />
      </svg>
      <span className="font-display text-base font-bold text-maroon">{pct}<span className="text-[10px]">%</span></span>
    </div>
  );
}

function EventCard({ e, rank, hasInterests, registered, onRegister }) {
  const pct = Math.min(100, Math.round((e.score / e.maxScore) * 100));
  const best = hasInterests && rank === 1;
  return (
    <article className={`${CARD} overflow-hidden`}>
      <div className={`h-1.5 ${best ? 'bg-gradient-to-r from-maroon via-gold to-maroon' : 'bg-sand-deep'}`} />
      <div className="p-5 sm:p-6">
        <div className="flex items-start gap-4">
          <MatchRing pct={pct} />
          <div className="min-w-0 flex-1">
            <p className="flex flex-wrap items-center gap-2 text-sm text-ink/65">
              {best ? <span className="rounded-full bg-gold px-2.5 py-0.5 text-xs font-bold text-white">Best match</span> : <span className="font-semibold">#{rank}</span>}
              <span>{e.category}</span>
            </p>
            <h3 className="mt-1 font-display text-xl font-bold leading-snug text-maroon-dark sm:text-2xl">{e.title}</h3>
          </div>
        </div>
        <p className="mt-3 max-w-prose text-ink/75">{e.description}</p>
        <ul className="mt-4 flex flex-wrap gap-1.5" aria-label="Required skills">
          {e.skills.map((s) => (
            <li key={s} className={`rounded-full px-2.5 py-1 text-xs font-semibold ${e.matchedSkills.includes(s) ? 'bg-maroon text-cream' : 'bg-sand text-ink/70'}`}>{s}</li>
          ))}
        </ul>
        <div className="mt-4 rounded-xl border border-gold/30 bg-sand/60 p-3">
          <p className="text-sm font-bold text-maroon">Why this event</p>
          <ul className="mt-1.5 space-y-1 text-sm">
            {e.reasons.map((r) => <li key={r} className="flex gap-2"><span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-gold" />{r}</li>)}
          </ul>
        </div>
        <div className="mt-5 flex flex-col gap-4 border-t border-sand-deep/70 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm">
            <p className="font-semibold">{fmtDate(e.startsAt)}</p>
            <p className={`font-semibold ${e.isOnline ? 'text-leaf' : 'text-gold'}`}>{e.isOnline ? 'Online' : `In person: ${e.location}`}</p>
          </div>
          <div className="flex flex-col items-stretch gap-1.5 sm:items-end">
            {registered ? (
              <span className="inline-flex items-center justify-center gap-2 rounded-xl bg-leaf px-7 py-3 text-base font-bold text-white sm:min-w-44">Registered ✓</span>
            ) : (
              <button type="button" onClick={() => onRegister(e)}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-maroon px-7 py-3 text-base font-bold text-cream shadow-[0_8px_20px_-8px_rgba(107,20,40,.8)] ring-2 ring-gold/70 transition hover:bg-maroon-dark hover:ring-gold sm:min-w-44">
                Register now
                <svg viewBox="0 0 20 20" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M4 10h12m-5-5 5 5-5 5" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </button>
            )}
            <a href={e.registrationUrl} target="_blank" rel="noreferrer" className="text-center text-xs font-semibold text-maroon underline sm:text-right">Event page</a>
          </div>
        </div>
      </div>
    </article>
  );
}

const Skeleton = () => (
  <div className="space-y-4" aria-hidden="true">{[0, 1, 2].map((i) => <div key={i} className="skeleton h-64 rounded-2xl" />)}</div>
);

function Notice({ title, children, action, tone = 'neutral' }) {
  return (
    <div role={tone === 'error' ? 'alert' : 'status'} className={`rounded-2xl border-2 border-dashed p-8 text-center ${tone === 'error' ? 'border-rose/50 bg-rose/5' : 'border-gold/50 bg-cream/70'}`}>
      <h3 className="font-display text-xl font-bold text-maroon-dark">{title}</h3>
      <div className="mx-auto mt-2 max-w-md text-ink/70">{children}</div>
      {action}
    </div>
  );
}

export default function App() {
  const [interests, setInterests] = useState(['React.js']);
  const [draft, setDraft] = useState('');
  const [inputError, setInputError] = useState('');
  const [filters, setFilters] = useState({ technology: '', category: '', format: '', dateRange: 'all' });
  const [options, setOptions] = useState({ technologies: [], categories: [], experienceLevels: [] });
  const [state, setState] = useState({ status: 'loading', events: [], error: null });
  const [retry, setRetry] = useState(0);
  const [target, setTarget] = useState(null);
  const [registered, setRegistered] = useState([]);

  useEffect(() => { getFilters().then(setOptions).catch(() => {}); }, []);

  useEffect(() => {
    const ctrl = new AbortController();
    setState((s) => ({ ...s, status: 'loading', error: null }));
    getRecommendations({ ...filters, interests }, ctrl.signal)
      .then((r) => setState({ status: 'ready', events: r.data, error: null }))
      .catch((err) => err.name !== 'AbortError' && setState({ status: 'error', events: [], error: err }));
    return () => ctrl.abort();
  }, [interests, filters, retry]);

  const addInterest = (raw) => {
    const v = raw.trim();
    if (!v) return setInputError('Type a technology, like Next.js or PostgreSQL.');
    if (v.length > 40 || !INTEREST_RE.test(v)) return setInputError('Use letters, numbers and . + # - only (max 40 characters).');
    if (interests.some((i) => i.toLowerCase() === v.toLowerCase())) return setInputError(`${v} is already selected.`);
    if (interests.length >= 10) return setInputError('You can pick up to 10 interests.');
    setInterests([...interests, v]); setDraft(''); setInputError('');
  };
  const toggle = (p) => interests.includes(p) ? setInterests(interests.filter((i) => i !== p)) : addInterest(p);
  const set = (k) => (v) => setFilters((f) => ({ ...f, [k]: v }));
  const hasFilters = useMemo(() => filters.technology || filters.category || filters.format || filters.dateRange !== 'all', [filters]);
  const reset = () => setFilters({ technology: '', category: '', format: '', dateRange: 'all' });
  const custom = interests.filter((i) => !options.technologies.includes(i));

  return (
    <div className="mx-auto max-w-6xl px-4 pb-16 pt-6 sm:px-6">
      <header className="relative mb-8 overflow-hidden rounded-3xl bg-gradient-to-br from-maroon-dark via-maroon to-[#8a2238] p-7 text-cream shadow-[0_30px_60px_-30px_rgba(69,16,25,.9)] sm:p-12">
        <div aria-hidden="true" className="absolute -right-16 -top-16 size-64 rounded-full border-[28px] border-gold/25" />
        <div aria-hidden="true" className="absolute -bottom-24 right-24 size-56 rounded-full border-[18px] border-sand/10" />
        <p className="relative font-display text-lg font-bold text-gold">Eventfit</p>
        <h1 className="relative mt-3 max-w-3xl font-display text-4xl font-extrabold leading-[1.08] tracking-tight sm:text-6xl">Find events that fit the stack you build with.</h1>
        <p className="relative mt-4 max-w-xl text-lg text-sand/85">Pick your interests and we rank upcoming events by skill match, interest match and how soon they start. Every result tells you why.</p>
      </header>

      <div className="grid gap-8 lg:grid-cols-[340px_1fr]">
        <aside className={`${CARD} space-y-6 self-start p-5 lg:sticky lg:top-6`}>
          <section aria-labelledby="int">
            <h2 id="int" className="font-display text-lg font-bold text-maroon-dark">Your interests</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {options.technologies.map((p) => (
                <button key={p} type="button" aria-pressed={interests.includes(p)} onClick={() => toggle(p)}
                  className={`rounded-full border px-3 py-1.5 text-sm font-semibold transition ${interests.includes(p) ? 'border-maroon bg-maroon text-cream' : 'border-sand-deep bg-white hover:border-maroon hover:text-maroon'}`}>{p}</button>
              ))}
            </div>
            <form onSubmit={(e) => { e.preventDefault(); addInterest(draft); }} className="mt-3">
              <label htmlFor="custom" className="text-sm font-semibold">Add your own</label>
              <div className="mt-1.5 flex gap-2">
                <input id="custom" value={draft} onChange={(e) => { setDraft(e.target.value); setInputError(''); }} placeholder="e.g. NestJS"
                  aria-invalid={!!inputError} aria-describedby="custom-err" className="min-w-0 flex-1 rounded-xl border border-sand-deep bg-white px-3 py-2 text-sm" />
                <button className="rounded-xl bg-gold px-4 text-sm font-bold text-white transition hover:bg-maroon">Add</button>
              </div>
              <p id="custom-err" className="mt-1.5 min-h-5 text-sm text-rose">{inputError}</p>
            </form>
            {custom.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {custom.map((i) => <button key={i} onClick={() => toggle(i)} aria-label={`Remove ${i}`} className="rounded-full bg-maroon px-3 py-1.5 text-sm font-semibold text-cream">{i} ×</button>)}
              </div>
            )}
          </section>

          <section aria-labelledby="flt" className="space-y-4 border-t border-sand-deep/70 pt-5">
            <div className="flex items-center justify-between">
              <h2 id="flt" className="font-display text-lg font-bold text-maroon-dark">Filters</h2>
              {hasFilters && <button onClick={reset} className="text-sm font-semibold text-maroon underline">Clear filters</button>}
            </div>
            <Select label="Technology" value={filters.technology} onChange={set('technology')} options={options.technologies} any="All technologies" />
            <Select label="Category" value={filters.category} onChange={set('category')} options={options.categories} any="All categories" />
            <Segmented label="Date" value={filters.dateRange} onChange={set('dateRange')} options={DATES} />
            <Segmented label="Format" value={filters.format} onChange={set('format')} options={FORMATS} />
          </section>
        </aside>

        <main aria-busy={state.status === 'loading'}>
          <div className="mb-4 flex items-baseline justify-between">
            <h2 className="font-display text-2xl font-bold text-maroon-dark">Recommended for you</h2>
            {state.status === 'ready' && <p className="rounded-full bg-cream px-3 py-1 text-sm font-semibold text-maroon" aria-live="polite">{state.events.length} event{state.events.length !== 1 && 's'}</p>}
          </div>
          {state.status === 'loading' && <Skeleton />}
          {state.status === 'error' && (
            <Notice tone="error" title={state.error.status === 400 ? 'Those filters are not valid' : 'We could not load events'}
              action={<button onClick={state.error.status === 400 ? reset : () => setRetry((n) => n + 1)} className={`mt-4 ${BTN}`}>{state.error.status === 400 ? 'Reset filters' : 'Try again'}</button>}>
              <p>{state.error.message}</p>
              {state.error.details?.length > 0 && <ul className="mt-2 text-sm">{state.error.details.map((d) => <li key={d}>{d}</li>)}</ul>}
            </Notice>
          )}
          {state.status === 'ready' && state.events.length === 0 && (
            <Notice title="No events match yet" action={<button onClick={reset} className={`mt-4 ${BTN}`}>Clear filters</button>}>
              <p>Try a wider date range, another format, or remove a technology filter. New events are added regularly.</p>
            </Notice>
          )}
          {state.status === 'ready' && state.events.length > 0 && (
            <div className="space-y-5">
              {interests.length === 0 && <p className="rounded-xl bg-cream p-3 text-sm">No interests selected, so events are sorted by start date. Pick an interest to personalise the ranking.</p>}
              {state.events.map((e, i) => <EventCard key={e.id} e={e} rank={i + 1} hasInterests={interests.length > 0} registered={registered.includes(e.id)} onRegister={setTarget} />)}
            </div>
          )}
        </main>
      </div>
      {target && <RegisterModal event={target} levels={options.experienceLevels} onClose={() => setTarget(null)} onDone={(id) => setRegistered((r) => [...r, id])} />}
    </div>
  );
}
