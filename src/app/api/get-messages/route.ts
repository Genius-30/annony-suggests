import dbConnect from "@/lib/dbConnect";
import { getServerSession, User as typeUser } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import { ErrorResponse, SuccessResponse } from "@/utils/responseUtils";
import User from "@/model/user.model";

export async function GET(request: Request) {
  await dbConnect();

  const session = await getServerSession(authOptions);
  const user: typeUser = session?.user as typeUser;

  if (!session || !session.user) {
    return ErrorResponse("Not Authenticated!", 401);
  }

  const userId = user._id;

  try {
    const user = await User.aggregate([
      {
        $match: { _id: userId },
      },
      {
        $unwind: "$messages",
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
    ]);

    if (!user || user.length === 0) {
      return ErrorResponse("User not found!", 404);
    }
    return SuccessResponse("Messages fetched successfully!", user[0].messages);
  } catch (error) {
    return ErrorResponse("Error updating accepting messages status!", 500);
  }
}
