import { ErrorResponse } from "@/utils/responseUtils";
import { openai } from "@ai-sdk/openai";
import { streamText } from "ai";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const prompt =
      "Imagine you are creating a website where users can ask and answer anonymous questions, similar to Qooh.me. The goal is to foster interesting, thoughtful, and engaging conversations among users. Generate a list of three open-ended questions that are designed to spark creativity and deep thinking. The questions should be intriguing and allow for a wide range of responses. Avoid simple yes/no questions or questions that can be answered in just a few words. The result must be in a single quote string, and each question should be divided with '||'. Here are three examples to guide you: 'What's a moment in your life that changed your perspective on something important? || If you could have dinner with any historical figure, who would it be and why? || What is a dream you've had that you would love to see come true someday?' Now, generate three unique open-ended questions that will encourage users to share their thoughts and experiences.";

    const result = await streamText({
      model: openai("gpt-4-turbo"),
      prompt,
    });

    return result.toAIStreamResponse();
  } catch (error) {
    return ErrorResponse("An unexpected error occured!", 500);
  }
}
