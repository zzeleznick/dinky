export class BaseError extends Error {
  status: number;
  constructor(msg: string) {
    super(msg);
    this.name = "BaseError";
    this.status = 500;
  }
}

export class TokenError extends BaseError {
  constructor(msg: string) {
    super(msg);
    this.name = "TokenError";
    this.status = 401;
  }
}
