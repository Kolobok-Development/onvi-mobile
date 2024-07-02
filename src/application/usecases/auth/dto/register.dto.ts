export class RegisterDto {
    phone: string;
    otp: string;
    deviceId?: string;
    model?: string;
    name?: string;
    platform?: string;
    platformVersion?: string;
    manufacturer?: string;
    appToken?: string;
    isEmulator?: number;
    mac?: string;
}