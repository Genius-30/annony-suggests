import dbConnect from "@/lib/dbConnect";
import { getServerSession, User as typeUser } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";
import { ErrorResponse, SuccessResponse } from "@/utils/responseUtils";
import User from "@/model/user.model";

export async function DELETE(
  request: Request,
  { params }: { params: { messageid: string } }
) {
  const messageId = params.messageid;
  await dbConnect();

  const session = await getServerSession(authOptions);
  const _user: typeUser = session?.user as typeUser;

  if (!session || !_user) {
    return ErrorResponse("Not Authenticated!", 401);
  }

  try {
    const updateResult = await User.updateOne(
      { _id: _user._id },
      { $pull: { messages: { _id: messageId } } }
    );

    if (updateResult.modifiedCount == 0) {
      return ErrorResponse("Message not found or Already deleted!", 404);
    }

    return SuccessResponse("Message deleted successfully!");
  } catch (error) {
    return ErrorResponse("Something went wrong!", 500);
  }
}
