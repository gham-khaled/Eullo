export interface Conversation {
  sender: string;
  receiver: string;
  messages: [{message: string, status: string}];
}
