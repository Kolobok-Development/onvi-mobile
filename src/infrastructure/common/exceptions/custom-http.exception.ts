import { HttpException } from '@nestjs/common';

interface IErrorOptions {
  type?: string;
  innerCode?: number;
  message?: string;
  code: number;
}
export class CustomHttpException extends HttpException {
  type: string;
  innerCode: number;
  constructor({
    type = 'api_server',
    innerCode = 551,
    message,
    code,
  }: IErrorOptions) {
    super(message, code);
    this.type = type;
    this.innerCode = innerCode;
  }
}
