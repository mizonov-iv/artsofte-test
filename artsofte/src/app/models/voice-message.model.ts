// Типизация одного голосового сообщения:
export interface VoiceMessage {
  id: string;
  received: string;
  from: string;
  to: string;
  date: string;
  duration: number;
  audioUrl: string;
}
