import User, { IMessage } from "@/model/user.model";
import { ErrorResponse, SuccessResponse } from "@/utils/responseUtils";

export async function POST(request: Request) {
  try {
    const { username, content } = await request.json();

    if (!username) {
      return ErrorResponse("Username is missing!", 400);
    }

    if (!content || content.trim().length === 0) {
      return ErrorResponse("Content is missing!", 400);
    }

    const user = await User.findOne({ username });

    if (!user) {
      return ErrorResponse("User not found!", 404);
    }

    if (!user?.isAcceptingMessages) {
      return ErrorResponse("User is not accepting messages!", 400);
    }

    const newMessage = { content, createdAt: new Date() };

    user.messages.push(newMessage as IMessage);
    await user.save();

    return SuccessResponse("Message sent successfully!");
  } catch (error) {
    return ErrorResponse(
      "Something went wrong while sending the message!",
      500
    );
  }
}
