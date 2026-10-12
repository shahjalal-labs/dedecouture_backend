import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { commentService } from "./comment.service";

const createComment = catchAsync(async (req, res) => {
  const result = await commentService.createCommentIntoDB(
    req.user.id,
    req.body
  );
  sendResponse(res, {
    success: true,
    statusCode: 201,
    message: "Comment submitted successfully",
    data: result,
  });
});
const createReply = catchAsync(async (req, res) => {
  const result = await commentService.createReplyIntoDB(
    req.user.id,
    req.body
  );
  sendResponse(res, {
    success: true,
    statusCode: 201,
    message: "Reply submitted successfully",
    data: result,
  });
});

export const commentController = {
  createComment,
  createReply
};
