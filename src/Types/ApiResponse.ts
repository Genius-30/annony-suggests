import { Message } from "@/model/user.model";

export interface ApiResponse {
  success: boolean;
  message: string;
  messages?: Array<Message>;
  isAcceptingMessages?: boolean;
}
