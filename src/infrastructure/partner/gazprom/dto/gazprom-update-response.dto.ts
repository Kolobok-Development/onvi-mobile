export class GazpromUpdateResponseDto {
  code: number;
  data: any;

  constructor(code: number, data: any) {
    this.data = data;
    this.code = code;
  }
}
