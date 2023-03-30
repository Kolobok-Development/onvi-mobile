export class AuthUsecase {
  /*
        TODO
        1) Inject Account Repository
        2) Inject JwtService
        3) Inject Bcrypt Service
        4) Inject jwtConfig  
     */
  constructor() {}

  public async isAuthenticated(phone: string) {}

  public async validateUser(phone: string): Promise<any> {}

  public async register(phone: string): Promise<any> {}

  public async login(phone: string, otp: string): Promise<any> {}

  public async signAccessToken(payload: any) {}

  public async signRefreshToken(payload: any) {}

  public async setCurrentRefreshToken(phone: string, refreshToken: string) {}

  public async getAccountIfRefreshTokenMatches(
    refreshToken: string,
    phone: string,
  ) {}

  public async logout(phone: string) {}
  private async sendOtp(phone: string): Promise<any> {}
}
