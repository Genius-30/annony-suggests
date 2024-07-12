import dbConnect from "@/lib/dbConnect";
import User from "@/model/user.model";
import { usernameValidation } from "@/schemas/signUpSchema";
import { ErrorResponse, SuccessResponse } from "@/utils/responseUtils";
import { z } from "zod";

const UsernameQuerySchema = z.object({
  username: usernameValidation,
});

export async function GET(request: Request) {
  await dbConnect();

  try {
    const { searchParams } = new URL(request.url);
    const queryParam = { username: searchParams.get("username") };

    const result = UsernameQuerySchema.safeParse(queryParam);

    if (!result.success) {
      const usernameErrors = result.error.format().username?._errors || [];
      return ErrorResponse(
        usernameErrors?.length > 0
          ? usernameErrors.join(", ")
          : "Invalid query",
        400
      );
    }

    const { username } = result.data;

    const existingVerifiedUser = await User.findOne({
      username,
      isVerified: true,
    });

    if (existingVerifiedUser) {
      return ErrorResponse("Username is taken!", 400);
    }

    return SuccessResponse("Username is available!");
  } catch (error) {
    return ErrorResponse("Error validating user!", 500);
  }
}
