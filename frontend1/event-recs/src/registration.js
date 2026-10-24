// Shared client-side validation for the registration form (backend validates again).
export const LEVELS = ['Beginner', 'Intermediate', 'Advanced'];
export function validateRegistration(f) {
  const e = {};
  const name = (f.fullName || '').trim();
  if (name.length < 2 || name.length > 80 || !/^[\p{L} .'-]+$/u.test(name)) e.fullName = 'Enter your full name (2-80 letters).';
  const email = (f.email || '').trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) || email.length > 120) e.email = 'Enter a valid email, like name@example.com.';
  const phone = (f.phone || '').trim();
  if (phone && !/^\+?[0-9 -]{7,15}$/.test(phone)) e.phone = 'Use 7-15 digits. Spaces, - and a leading + are allowed.';
  if (!LEVELS.includes(f.experience)) e.experience = 'Choose your experience level.';
  if (!f.consent) e.consent = 'Please agree to receive event updates.';
  return e;
}