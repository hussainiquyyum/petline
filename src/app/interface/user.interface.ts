export interface User {
    username?: string;
    name: string;
    email?: string;
    tempPhone?: number;
    phone: number;
    otp?: string;
    otpExpiry?: Date | null;
    gender: string;
    dob: Date | null;
    editing?: boolean;
}