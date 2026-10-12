import { Request } from "express";
import prisma from "../../../shared/prisma";
import ApiError from "../../../errors/ApiErrors";
import { uploadInSpace } from "../../../shared/UploadHelper";
import { Comment, Reply } from "@prisma/client";

const createPostIntoDB = async (req: Request) => {
  const payload = req.body;
  const userId = req.user.id;
  const existingUser = await prisma.user.findUnique({
    where: { id: userId },
  });
  if (!existingUser) {
    throw new ApiError(409, "User not found!");
  }
  const files = req.files as { [fieldname: string]: Express.Multer.File[] };

  const processImages = async (
    files: Express.Multer.File[],
    folder: string
  ) => {
    if (!files || files.length === 0) return null;
    return Promise.all(
      files.map((file) => uploadInSpace(file, `courses/post/${folder}`))
    );
  };

  const [mediaUrls] = await Promise.all([
    processImages(files?.mediaUrls, "mediaUrls"),
  ]);

  const post = await prisma.post.create({
    data: {
      ...payload,
      userId,
      mediaUrls: (mediaUrls && mediaUrls) || [],
    },
  });
  return post;
};

const getAllPostsFromDB = async (userId: string, search?: string) => {
  const posts = await prisma.post.findMany({
    where: search
      ? {
          postBody: {
            contains: search,
            mode: "insensitive",
          },
        }
      : undefined,
    include: {
      _count: {
        select: {
          comment: true,
        },
      },
      user: {
        select: {
          id: true,
          profileImage: true,
          userName: true,
        },
      },
      like: {
        where: {
          userId: userId,
        },
        select: {
          id: true,
        },
      },
    },
  });

  if (posts.length < 1) {
    throw new ApiError(404, "No post found.");
  }

  const postsWithCommentCount = posts.map(({ _count, ...rest }) => ({
    ...rest,
    commentCount: _count.comment,
  }));

  return postsWithCommentCount;
};

const getMyPostsFromDB = async (userId: string) => {
  const posts = await prisma.post.findMany({
    where: { userId },
    include: {
      _count: {
        select: {
          comment: true,
        },
      },
      user: {
        select: {
          id: true,
          profileImage: true,
          userName: true,
        },
      },
      like: {
        where: {
          userId: userId,
        },
        select: {
          id: true,
        },
      },
    },
  });

  if (posts.length < 1) {
    throw new ApiError(404, "No post found.");
  }

  const postsWithCommentCount = posts.map(({ _count, ...rest }) => ({
    ...rest,
    commentCount: _count.comment,
  }));

  return postsWithCommentCount;
};

const getPostDetailsFromDB = async (userId: string, postId: string) => {
  const post = await prisma.post.findUnique({
    where: { id: postId },
    include: {
      user: {
        select: {
          id: true,
          profileImage: true,
          userName: true,
        },
      },
      like: {
        where: {
          userId: userId,
        },
        select: {
          id: true,
        },
      },
      comment: {
        select: {
          id: true,
          message: true,
          createdAt: true,
          user: {
            select: {
              id: true,
              userName: true,
              profileImage: true,
            },
          },
          reply: {
            select: {
              id: true,
              message: true,
              createdAt: true,
              user: {
                select: {
                  id: true,
                  userName: true,
                  profileImage: true,
                },
              },
            },
          },
        },
      },
    },
  });
  if (!post) {
    throw new ApiError(404, "Post not found");
  }
  return post;
};

const handleLikeUnlikePost = async (postId: string, userId: string) => {
  const existingPost = await prisma.post.findUnique({
    where: { id: postId },
  });

  if (!existingPost) {
    throw new ApiError(404, "Post not found");
  }

  const existingLike = await prisma.like.findFirst({
    where: {
      postId,
      userId,
    },
  });

  if (existingLike) {
    await prisma.like.delete({
      where: { id: existingLike.id },
    });

    await prisma.post.update({
      where: { id: postId },
      data: { likes: { decrement: 1 } },
    });

    return { liked: false, message: "Post Unliked successfully" };
  } else {
    await prisma.like.create({
      data: {
        postId,
        userId,
      },
    });

    await prisma.post.update({
      where: { id: postId },
      data: { likes: { increment: 1 } },
    });

    return { liked: true, message: "Post liked Successfully" };
  }
};

const getLikesFromDB = async (userId: string) => {
  const existingUser = await prisma.user.findUnique({
    where: { id: userId },
  });
  if (!existingUser) {
    throw new ApiError(404, "user not found");
  }
  const likes = await prisma.like.findMany({
    where: { userId },
  });

  if (likes.length < 1) {
    throw new ApiError(404, "No likes found");
  }
  return likes;
};

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

export const postService = {
  createPostIntoDB,
  getAllPostsFromDB,
  handleLikeUnlikePost,
  getLikesFromDB,
  getPostDetailsFromDB,
  createCommentIntoDB,
  createReplyIntoDB,
  getMyPostsFromDB,
};
