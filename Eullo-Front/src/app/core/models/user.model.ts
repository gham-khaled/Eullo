export interface User {
  username: string;
  cardNumber: string;
  certificate: string;
  privateKey: string;
  encryptedKey?: string | null | undefined;
}


export interface RegisterRequest {
  name: string;
  lastName: string;
  username: string;
  password: string;
  cardNumber: string;
  certificateRequest: string;
}

export interface ChatItem {
  username: string;
  lastReceivedMessage: string;
  connected: boolean;
}
