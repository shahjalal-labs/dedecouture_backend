import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { reviewServices } from "./review.service";

const createReview = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const review = req.body;
  const result = await reviewServices.createReviewIntoDB(userId, review);

  sendResponse(res, {
    success: true,
    statusCode: 201,
    message: "Review submitted successfully",
    data: result,
  });
});

export const reviewController = {
  createReview,
};
