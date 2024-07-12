export const ErrorResponse = (message: string, statusCode = 400) => {
  return new Response(JSON.stringify({ success: false, message }), {
    status: statusCode,
  });
};

export const SuccessResponse = (message: string, data?: any) => {
  return new Response(JSON.stringify({ success: true, message }), {
    status: 200,
  });
};
