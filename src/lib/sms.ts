type SmsParams = {
  phone: string;
  kidName: string;
  raffleNumber: number;
};

export type SmsResult = {
  success: boolean;
  error?: string;
};

export async function sendSms({ phone, kidName, raffleNumber }: SmsParams) {
  const sender = process.env.SMS_SENDER_NUMBER;
  const apiKey = process.env.SMS_API_KEY;
  const apiSecret = process.env.SMS_API_SECRET;

  if (!sender || !apiKey || !apiSecret) {
    return {
      success: false,
      error: "SMS not configured",
    } satisfies SmsResult;
  }

  const message = `Congratulations! ${kidName} is entered in the raffle. Your raffle number is: ${raffleNumber
    .toString()
    .padStart(3, "0")}`;

  // Placeholder: integrate with provider SDK or HTTPS API here.
  // For now, return a mocked success so persistence flow can proceed.
  console.info("[sms] sending", { to: phone, sender });
  void message;

  return {
    success: false,
    error: "SMS sending not implemented. Please integrate provider.",
  } satisfies SmsResult;
}

