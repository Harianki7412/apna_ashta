const AUTH = process.env.MSG91_AUTH_KEY!;
const TEMPLATE = process.env.MSG91_TEMPLATE_ID!;

export async function sendOtp(phone: string): Promise<boolean> {
  const res = await fetch('https://control.msg91.com/api/v5/otp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', authkey: AUTH },
    body: JSON.stringify({ template_id: TEMPLATE, mobile: `91${phone}`, otp_length: 6, otp_expiry: 5 }),
  });
  const data = await res.json();
  return data.type === 'success';
}

export async function verifyOtp(phone: string, otp: string): Promise<boolean> {
  const res = await fetch(
    `https://control.msg91.com/api/v5/otp/verify?mobile=91${phone}&otp=${otp}`,
    { headers: { authkey: AUTH } }
  );
  const data = await res.json();
  return data.type === 'success';
}