import dbConnect from "@/lib/dbConnect";
import { getServerSession, User as typeUser } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import { ErrorResponse, SuccessResponse } from "@/utils/responseUtils";
import User from "@/model/user.model";

export async function POST(request: Request) {
  await dbConnect();

  const session = await getServerSession(authOptions);
  const user: typeUser = session?.user as typeUser;

  if (!session || !session.user) {
    return ErrorResponse("Not Authenticated!", 401);
  }

  const userId = user._id;
  const { acceptMessages } = await request.json();

  try {
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        isAcceptingMessages: acceptMessages,
      },
      { new: true }
    );

    if (!updatedUser) {
      return ErrorResponse(
        "Failed to update user status to accepting messages!",
        401
      );
    }

    return SuccessResponse(
      "Successfully updated user status to accepting messages!"
    );
  } catch (error) {
    return ErrorResponse("Error updating accepting messages status!", 500);
  }
}

export async function GET(request: Request) {
  await dbConnect();

  const session = await getServerSession(authOptions);
  const user: typeUser = session?.user as typeUser;

  if (!session || !session.user) {
    return ErrorResponse("Not Authenticated!", 401);
  }

  const userId = user._id;

  try {
    const foundUser = await User.findById(userId);
    if (!foundUser) {
      return ErrorResponse("User not found!", 404);
    }

    return SuccessResponse("Accepting messages status fetched successfully!", {
      isAcceptingMessages: foundUser.isAcceptingMessages,
    });
  } catch (error) {
    return ErrorResponse("Error fetching accepting messages status!", 500);
  }
}
