import dbConnect from "@/lib/dbConnect";
import User from "@/model/user.model";
import { verifySchema } from "@/schemas/verifySchema";
import { ErrorResponse, SuccessResponse } from "@/utils/responseUtils";

export async function POST(request: Request) {
  await dbConnect();

  try {
    const { username, code } = await request.json();

    const user = await User.findOne({ username });

    if (!user) {
      return ErrorResponse("User not found with given username!", 404);
    }

    const codeValidationResult = verifySchema.safeParse({ code });

    if (!codeValidationResult.success) {
      const codeErrors =
        codeValidationResult.error.format().code?._errors || [];
      return ErrorResponse(
        codeErrors?.length > 0 ? codeErrors.join(", ") : "Invalid code",
        400
      );
    }

    const isCodeValid = user.verifyCode === code;
    const isCodeExpired = new Date(user.verifyCodeExpiry) < new Date();

    if (!isCodeValid) {
      return ErrorResponse("Incorrect code!", 400);
    } else if (isCodeExpired) {
      return ErrorResponse("Code expired! Please request a new code.", 400);
    } else {
      user.isVerified = true;
      await user.save();
      return SuccessResponse("User verified successfully! You can now login.");
    }
  } catch (error: any) {
    return ErrorResponse("Error verifying user!", 500);
  }
}
