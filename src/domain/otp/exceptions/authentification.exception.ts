import { HttpException, HttpStatus } from '@nestjs/common';
export const AUTHENTIFICATION_EXCEPTION_TYPE = 'server';

export class AuthentificationException extends HttpException {
  constructor(message: string[] = null) {
    super(
      {
        error: 'Authentification internal error',
        type: AUTHENTIFICATION_EXCEPTION_TYPE,
        message: message,
      },
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}
