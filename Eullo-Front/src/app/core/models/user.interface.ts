export interface User {
  username: string;
  cardNumber: string;
  certificate: string;
  encryptedPrivateKey?: string | null | undefined;
}


export interface RegisterRequest {
  name: string;
  lastName: string;
  username: string;
  password: string;
  cardNumber: string;
  certificateRequest: string;
}
