export declare type tLoginRes = {
  email: string;
  accessToken: string;
  refreshToken: string;
};

export declare type tChangePwRes = {
  success: boolean;
};

export declare type tAccount = {
  userId: string;
  password: string | null;
  email: string;
  name: string ;
  birthdate: Date | null;
  gender: boolean | null;
};

