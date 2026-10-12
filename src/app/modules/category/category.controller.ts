import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { categoryService } from "./category.service";

const createCategory = catchAsync(async (req, res) => {
  const result = await categoryService.createCategoryIntoDB(req);

  sendResponse(res, {
    success: true,
    statusCode: 201,
    message: "Category created successfully",
    data: result,
  });
});
const getCategories = catchAsync(async (req, res) => {
  const result = await categoryService.getCategoriesFromDB();

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Categories retrieved successfully",
    data: result,
  });
});
const getCategory = catchAsync(async (req, res) => {
  const result = await categoryService.getSingleCategoryBrandsFromDB(req.params.id);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Category retrieved successfully",
    data: result,
  });
});

export const categoryController = {
  createCategory,
  getCategories,
  getCategory
};
