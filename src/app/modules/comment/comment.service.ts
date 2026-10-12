import { Comment, Reply } from "@prisma/client";
import ApiError from "../../../errors/ApiErrors";
import prisma from "../../../shared/prisma";

const createCommentIntoDB = async (userId: string, payload: Comment) => {
  const existingPost = await prisma.post.findUnique({
    where: { id: payload.postId },
  });
  if (!existingPost) {
    throw new ApiError(404, "Post not found");
  }
  const existingUser = await prisma.user.findUnique({
    where: { id: userId },
  });
  if (!existingUser) {
    throw new ApiError(404, "User not found");
  }

  const comment = await prisma.comment.create({
    data: {
      userId,
      postId: payload.postId,
      message: payload.message,
    },
  });
  return comment;
};
const createReplyIntoDB = async (userId: string, payload: Reply) => {
  const existingComment = await prisma.comment.findUnique({
    where: { id: payload.commentId },
  });
  if (!existingComment) {
    throw new ApiError(404, "Comment not found");
  }
  const existingUser = await prisma.user.findUnique({
    where: { id: userId },
  });
  if (!existingUser) {
    throw new ApiError(404, "User not found");
  }

  const comment = await prisma.reply.create({
    data: {
      userId,
      commentId: payload.commentId,
      message: payload.message,
    },
  });
  return comment;
};

export const commentService = {
  createCommentIntoDB,
  createReplyIntoDB
};
