import { useEffect, useState } from 'react';
import { registerForEvent } from './api.js';
import { LEVELS, validateRegistration } from './registration.js';

const input = 'mt-1.5 w-full rounded-xl border border-sand-deep bg-white px-3 py-2.5 text-sm';
const fmt = (iso) => new Date(iso).toLocaleString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', hour: 'numeric', minute: '2-digit' });

function Field({ id, label, error, children, hint }) {
  return (
    <div>
      <label htmlFor={id} className="text-sm font-semibold">{label}</label>
      {children}
      {hint && !error && <p className="mt-1 text-xs text-ink/55">{hint}</p>}
      {error && <p id={`${id}-err`} className="mt-1 text-sm text-rose">{error}</p>}
    </div>
  );
}

export default function RegisterModal({ event, onClose, onDone }) {
  const [form, setForm] = useState({ fullName: '', email: '', phone: '', experience: '', consent: false });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('idle');
  const [serverError, setServerError] = useState('');
  const [reg, setReg] = useState(null);

  useEffect(() => {
    const onKey = (k) => k.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const set = (k) => (e) => { setForm({ ...form, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }); setErrors({ ...errors, [k]: undefined }); };
  const bind = (k) => ({ id: k, value: form[k], onChange: set(k), 'aria-invalid': !!errors[k], 'aria-describedby': errors[k] ? `${k}-err` : undefined });

  async function submit(ev) {
    ev.preventDefault();
    const errs = validateRegistration(form);
    if (Object.keys(errs).length) return setErrors(errs);
    setStatus('submitting'); setServerError('');
    try {
      const r = await registerForEvent(event.id, { ...form, fullName: form.fullName.trim(), email: form.email.trim(), phone: form.phone.trim() });
      setReg(r.data); setStatus('done'); onDone(event.id);
    } catch (err) {
      setStatus('idle');
      const fields = {};
      (err.details || []).forEach((d) => { const [k, ...m] = d.split(': '); fields[k] = m.join(': '); });
      if (err.status === 409) fields.email = err.message;
      Object.keys(fields).length ? setErrors(fields) : setServerError(err.message);
    }
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-maroon-dark/70 p-4 backdrop-blur-sm" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div role="dialog" aria-modal="true" aria-labelledby="reg-title" className="my-8 w-full max-w-lg overflow-hidden rounded-3xl bg-cream shadow-2xl">
        <div className="bg-gradient-to-br from-maroon-dark to-maroon p-6 text-cream">
          <p className="text-sm font-semibold text-gold">{status === 'done' ? 'Registration confirmed' : 'Register for'}</p>
          <h2 id="reg-title" className="mt-1 font-display text-2xl font-bold leading-snug">{event.title}</h2>
          <p className="mt-2 text-sm text-sand/80">{fmt(event.startsAt)} · {event.isOnline ? 'Online' : event.location}</p>
        </div>
        {status === 'done' ? (
          <div className="space-y-4 p-6 text-center" role="status">
            <div className="mx-auto grid size-14 place-items-center rounded-full bg-leaf text-2xl text-white">✓</div>
            <p className="font-display text-xl font-bold text-maroon-dark">You are registered, {reg.fullName.split(' ')[0]}.</p>
            <p className="text-ink/70">Reference <b>REG-{String(reg.id).padStart(4, '0')}</b>. A confirmation will be sent to {reg.email}.</p>
            <a href={event.registrationUrl} target="_blank" rel="noreferrer" className="block text-sm font-semibold text-maroon underline">Open the event page</a>
            <button onClick={onClose} className="w-full rounded-xl bg-maroon py-3 font-bold text-cream hover:bg-maroon-dark">Done</button>
          </div>
        ) : (
          <form onSubmit={submit} noValidate className="space-y-4 p-6">
            {serverError && <p role="alert" className="rounded-xl bg-rose/10 p-3 text-sm text-rose">{serverError}</p>}
            <Field id="fullName" label="Full name" error={errors.fullName}><input {...bind('fullName')} autoFocus autoComplete="name" className={input} placeholder="Asha Kumar" /></Field>
            <Field id="email" label="Email" error={errors.email}><input {...bind('email')} type="email" autoComplete="email" className={input} placeholder="asha@example.com" /></Field>
            <Field id="phone" label="Phone (optional)" error={errors.phone} hint="Used only for event reminders."><input {...bind('phone')} type="tel" autoComplete="tel" className={input} placeholder="+91 98765 43210" /></Field>
            <Field id="experience" label="Experience level" error={errors.experience}>
              <select {...bind('experience')} className={input}><option value="">Select level</option>{LEVELS.map((l) => <option key={l}>{l}</option>)}</select>
            </Field>
            <div>
              <label className="flex items-start gap-2 text-sm"><input type="checkbox" checked={form.consent} onChange={set('consent')} className="mt-1 size-4 accent-[#6b1428]" />I agree to receive updates about this event.</label>
              {errors.consent && <p className="mt-1 text-sm text-rose">{errors.consent}</p>}
            </div>
            <div className="flex gap-3 pt-1">
              <button type="button" onClick={onClose} className="rounded-xl border border-sand-deep px-5 py-3 font-semibold hover:border-maroon">Cancel</button>
              <button disabled={status === 'submitting'} className="flex-1 rounded-xl bg-maroon py-3 font-bold text-cream ring-2 ring-gold/70 hover:bg-maroon-dark disabled:opacity-60">{status === 'submitting' ? 'Registering...' : 'Confirm registration'}</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
