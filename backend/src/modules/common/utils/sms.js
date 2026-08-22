import { env } from "../../../config/env.js";

const configured = Boolean(env.twilio.accountSid && env.twilio.authToken && env.twilio.fromNumber);

// Calls Twilio's REST API directly (Basic Auth + form-encoded POST) instead
// of pulling in the full `twilio` SDK for what is, here, a single endpoint -
// keeps the dependency footprint down. Swap this function's body for another
// provider's API if Twilio isn't the one in use.
export async function sendSms({ to, body }) {
  if (!configured) {
    console.log(`[sms] Twilio not configured - would have sent to ${to}:\n  ${body}`);
    return;
  }

  const url = `https://api.twilio.com/2010-04-01/Accounts/${env.twilio.accountSid}/Messages.json`;
  const auth = Buffer.from(`${env.twilio.accountSid}:${env.twilio.authToken}`).toString("base64");

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({ To: to, From: env.twilio.fromNumber, Body: body }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`SMS provider rejected the message (${res.status}): ${detail}`);
  }
}
