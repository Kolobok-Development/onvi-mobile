export class AuthenticationException extends Error {
  public readonly type = 'api_authentication';
  public readonly innerCode;
  constructor(innerCode: number, message: string) {
    super(message);
    this.innerCode = innerCode;
  }
}

export class NotAllowedException extends Error {
  public readonly type = 'api_authorization';
  public readonly innerCode;
  constructor(innerCode: number, message: string) {
    super(message);
    this.innerCode = innerCode;
  }
}

export class NotFoundException extends Error {
  public readonly type = 'api_not_found';
  public readonly innerCode;
  constructor(innerCode: number, message: string) {
    super(message);
    this.innerCode = innerCode;
  }
}

export class ClientException extends Error {
  public readonly type = 'api_client';
  public readonly innerCode;
  constructor(innerCode: number, message: string) {
    super(message);
    this.innerCode = innerCode;
  }
}

export class ServerException extends Error {
  public readonly type = 'server';
  public readonly innerCode;
  constructor(innerCode: number, message: string) {
    super(message);
    this.innerCode = innerCode;
  }
}
