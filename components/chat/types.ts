export type ChatRole = 'user' | 'assistant';

export type ChatMessageItem = {
  id: string;
  role: ChatRole;
  message: string;
  timestamp?: string;
};
