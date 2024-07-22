import dbConnect from "@/lib/dbConnect";
import { getServerSession, User as typeUser } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import mongoose from "mongoose";
import { ErrorResponse, SuccessResponse } from "@/utils/responseUtils";
import User from "@/model/user.model";

export async function GET(request: Request) {
  await dbConnect();

  const session = await getServerSession(authOptions);
  const _user: typeUser = session?.user as typeUser;

  if (!session || !_user) {
    return ErrorResponse("Not Authenticated!", 401);
  }

  const userId = new mongoose.Types.ObjectId(_user._id);

  try {
    const userMessages = await User.aggregate([
      {
        $match: { _id: userId },
      },
      {
        $unwind: {
          path: "$messages",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $sort: { "messages.createdAt": -1 },
      },
      {
        $group: {
          _id: "$_id",
          messages: { $push: "$messages" },
        },
      },
    ]).exec();

    if (!userMessages || userMessages.length === 0) {
      return ErrorResponse("User not found!", 404);
    }
    return SuccessResponse(
      "Messages fetched successfully!",
      userMessages[0].messages
    );
  } catch (error) {
    return ErrorResponse("Error fetching messages!", 500);
  }
}
