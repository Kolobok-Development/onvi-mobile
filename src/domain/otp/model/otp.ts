export class Otp {
  id: number;
  phone: string;
  otp: string;
  createDate: Date;
  expireDate: Date;
  ipAddress?: string;
  attempts = 0;

  constructor(id: number, phone: string, otp: string, expireDate: Date) {
    this.id = id;
    this.phone = phone;
    this.otp = otp;
    this.expireDate = expireDate;
    this.createDate = new Date(Date.now());
  }
}
