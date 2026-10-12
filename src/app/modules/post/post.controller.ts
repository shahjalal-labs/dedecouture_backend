import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { postService } from "./post.service";

const createPost = catchAsync(async (req, res) => {
  const result = await postService.createPostIntoDB(req);

  sendResponse(res, {
    success: true,
    statusCode: 201,
    message: "Post created successfully",
    data: result,
  });
});
const getPosts = catchAsync(async (req, res) => {
  const result = await postService.getAllPostsFromDB(
    req.user.id,
    req.query.search as string
  );

  sendResponse(res, {
    success: true,
    statusCode: 201,
    message: "Posts retrieved successfully",
    data: result,
  });
});
const getMyPosts = catchAsync(async (req, res) => {
  const result = await postService.getMyPostsFromDB(req.user.id);
  sendResponse(res, {
    success: true,
    statusCode: 201,
    message: "My Posts retrieved successfully",
    data: result,
  });
});
const getPostDetails = catchAsync(async (req, res) => {
  const result = await postService.getPostDetailsFromDB(
    req.user.id,
    req.params.id
  );

  sendResponse(res, {
    success: true,
    statusCode: 201,
    message: "Post details got successfully",
    data: result,
  });
});
const likeUnlikePost = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const result = await postService.handleLikeUnlikePost(req.params.id, userId);

  sendResponse(res, {
    success: true,
    statusCode: 201,
    message: `${result.message}`,
  });
});
const getLikes = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const result = await postService.getLikesFromDB(userId);

  sendResponse(res, {
    success: true,
    statusCode: 201,
    message: "Likes retrieved successfully",
    data: result,
  });
});
const createComment = catchAsync(async (req, res) => {
  const result = await postService.createCommentIntoDB(req.user.id, req.body);
  sendResponse(res, {
    success: true,
    statusCode: 201,
    message: "Comment submitted successfully",
    data: result,
  });
});
const createReply = catchAsync(async (req, res) => {
  const result = await postService.createReplyIntoDB(req.user.id, req.body);
  sendResponse(res, {
    success: true,
    statusCode: 201,
    message: "Reply submitted successfully",
    data: result,
  });
});

export const postController = {
  createPost,
  getPosts,
  likeUnlikePost,
  getLikes,
  getPostDetails,
  createComment,
  createReply,
  getMyPosts,
};
