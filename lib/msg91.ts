function getCredentials() {
  const authKey = process.env.MSG91_AUTH_KEY;
  const templateId = process.env.MSG91_TEMPLATE_ID;
  if (!authKey || !templateId) {
    throw new Error('SMS OTP service is not configured');
  }
  return { authKey, templateId };
}

function isSuccessfulResponse(data: unknown): boolean {
  return (
    typeof data === 'object' &&
    data !== null &&
    'type' in data &&
    data.type === 'success'
  );
}

export async function sendOtp(phone: string): Promise<boolean> {
  const { authKey, templateId } = getCredentials();
  const res = await fetch('https://control.msg91.com/api/v5/otp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', authkey: authKey },
    body: JSON.stringify({
      template_id: templateId,
      mobile: `91${phone}`,
      otp_length: 6,
      otp_expiry: 5,
    }),
  });
  const data: unknown = await res.json();
  return res.ok && isSuccessfulResponse(data);
}

export async function verifyOtp(phone: string, otp: string): Promise<boolean> {
  const { authKey } = getCredentials();
  const url = new URL('https://control.msg91.com/api/v5/otp/verify');
  url.searchParams.set('mobile', `91${phone}`);
  url.searchParams.set('otp', otp);
  const res = await fetch(url, { headers: { authkey: authKey } });
  const data: unknown = await res.json();
  return res.ok && isSuccessfulResponse(data);
}