export class RegisterRequestDto {
  phone: string;
  otp: string;
  isTermsAccepted?: boolean;
  isPromoTermsAccepted?: boolean;
}
