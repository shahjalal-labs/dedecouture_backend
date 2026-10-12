import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { adminServices } from "./admin.service";
import { UserRole } from "@prisma/client";

const brandAnalysisReport = catchAsync(async (req: Request, res: Response) => {
  const response = await adminServices.getBrandAnalysisReport();

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "brand analysis retrieved successfully",
    data: response,
  });
});
const monthwiseBrandReport = catchAsync(async (req: Request, res: Response) => {
  const response = await adminServices.getMonthwiseBrandReport();

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Month wise brands",
    data: response,
  });
});

const getAllUsers = catchAsync(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const search = req.query.search;
  const role = req.query.role;
  const result = await adminServices.getAllUsersFromDB(page, search as string,role as UserRole);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Users retrieved successfully",
    data: result,
  });
});
const getAllPosts = catchAsync(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const search = req.query.search;
  const result = await adminServices.getAllPostsFromDB(page, search as string);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Posts retrieved successfully",
    data: result,
  });
});
const getAllBrands = catchAsync(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const search = req.query.search;
  const category = req.query.category;
  const result = await adminServices.getAllBrandsFromDB(
    page,
    search as string,
    category as string
  );
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Brands retrieved successfully",
    data: result,
  });
});
const getAllReviews = catchAsync(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const search = req.query.search;
  const category = req.query.category;
  const result = await adminServices.getAllReviewsFromDB(
    page,
    search as string,
    category as string
  );
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Reviews retrieved successfully",
    data: result,
  });
});
const getMonthWiseReviews = catchAsync(async (req: Request, res: Response) => {
  const result = await adminServices.getMonthWisePositiveNegativeReview();
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Month wise review summary",
    data: result,
  });
});

export const adminController = {
  brandAnalysisReport,
  monthwiseBrandReport,
  getAllUsers,
  getAllBrands,
  getAllReviews,
  getAllPosts,
  getMonthWiseReviews
};
