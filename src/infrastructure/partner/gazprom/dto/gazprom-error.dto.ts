export class GazpromErrorDto {
  code: number;
  message: string;
  correlation_id: string;
  details: {};

  constructor(
    code: number,
    message: string,
    correlation_id: string,
    details: any,
  ) {
    this.code = code;
    this.message = message;
    this.correlation_id = correlation_id;
    this.details = details;
  }
}
