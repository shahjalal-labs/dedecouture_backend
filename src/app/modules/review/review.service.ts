import { Review } from "@prisma/client";
import prisma from "../../../shared/prisma";
import ApiError from "../../../errors/ApiErrors";

const createReviewIntoDB = async (userId: string, payload: Review) => {
  const existingBrand = await prisma.brand.findUnique({
    where: { id: payload.brandId },
  });

  if (!existingBrand) {
    throw new ApiError(404, "Brand not found");
  }

  const existingUser = await prisma.user.findUnique({
    where: {
      id: userId,
      role: "USER",
    },
  });

  if (!existingUser) {
    throw new ApiError(404, "User not found");
  }

  const result = await prisma.$transaction(async (tx) => {
    const review = await tx.review.create({
      data: {
        comment: payload.comment,
        rating: payload.rating,
        userId,
        brandId: payload.brandId,
      },
    });

    const stats = await tx.review.aggregate({
      where: { brandId: payload.brandId },
      _count: { _all: true },
      _avg: { rating: true },
    });
    await tx.brand.update({
      where: { id: payload.brandId },
      data: {
        totalReview: stats._count._all,
        avgRating: stats._avg.rating || 0,
      },
    });

    return review;
  });

  return result;
};

export const reviewServices = {
  createReviewIntoDB,
};
