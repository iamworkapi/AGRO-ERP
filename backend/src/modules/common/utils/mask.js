// Used only in the forgot-password response text, so a user can tell at a
// glance where their code went without the message fully exposing the
// underlying email/phone on screen.
export function maskEmail(email) {
  const [name, domain] = email.split("@");
  if (!domain) return email;
  return `${name.slice(0, 1)}${"*".repeat(Math.max(name.length - 1, 1))}@${domain}`;
}

export function maskPhone(phone) {
  if (phone.length <= 4) return "*".repeat(phone.length);
  return `${"*".repeat(phone.length - 4)}${phone.slice(-4)}`;
}
