import { IMessage } from "@/model/user.model";

export interface ApiResponse {
  success: boolean;
  message: string;
  messages?: Array<IMessage>;
  isAcceptingMessages?: boolean;
}
