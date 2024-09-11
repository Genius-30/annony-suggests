import dbConnect from "@/lib/dbConnect";
import User from "@/model/user.model";
import bcryptjs from "bcryptjs";
import { sendVerificationEmail } from "@/helpers/sendVerificationEmail";
import { ErrorResponse, SuccessResponse } from "@/utils/responseUtils";

export async function POST(request: Request) {
  await dbConnect();

  try {
    const { email, username, password } = await request.json();

    if (!(email && username && password)) {
      return ErrorResponse("Missing required fields!");
    }

    const existingVerifiedUserByUsername = await User.findOne({
      username,
      isVerified: true,
    });

    if (existingVerifiedUserByUsername) {
      return ErrorResponse("Username already taken!");
    }

    const existingUserByEmail = await User.findOne({
      email,
    });
    const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();

    if (existingUserByEmail) {
      if (existingUserByEmail.isVerified) {
        return ErrorResponse("User already exists with this email!");
      } else {
        const hashedPassword = await bcryptjs.hash(password, 10);

        existingUserByEmail.password = hashedPassword;
        existingUserByEmail.verifyCode = verifyCode;
        existingUserByEmail.verifyCodeExpiry = new Date(Date.now() + 3600000);

        await existingUserByEmail.save();
      }
    } else {
      const hashedPassword = await bcryptjs.hash(password, 10);
      const expiryDate = new Date();
      expiryDate.setHours(expiryDate.getHours() + 1);

      const newUser = new User({
        username,
        email,
        password: hashedPassword,
        verifyCode,
        verifyCodeExpiry: expiryDate,
        isVerified: false,
        isAcceptingMessages: true,
        messages: [],
      });

      await newUser.save();
    }

    const emailResponse = await sendVerificationEmail(
      email,
      username,
      verifyCode
    );

    if (!emailResponse.success) {
      return ErrorResponse(emailResponse.message, 500);
    }

    return SuccessResponse(
      "User registered successfully! Verify you email now."
    );
  } catch (error) {
    return ErrorResponse("Error registering user!", 500);
  }
}
