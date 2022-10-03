export declare type tLoginRes = {
  userId: string;
  token: string;
  refreshToken: string;
};

export declare type tChangePwRes = {
  success: boolean;
};

export declare type tAccount = {
  userId: string;
  password: string;
  role?: string;
};
