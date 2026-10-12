import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { brandService } from "./brand.service";

const createBrand = catchAsync(async (req, res) => {
  const result = await brandService.createBrandIntoDB(req);

  sendResponse(res, {
    success: true,
    statusCode: 201,
    message: "Brand created successfully",
    data: result,
  });
});
const getBrands = catchAsync(async (req, res) => {
  const categoryId = req.query.categoryId as string;
  const search = req.query.search as string;
  const rating = req.query.rating as string;
  const result = await brandService.getAllBrandsFromDB(
    categoryId,
    search,
    rating
  );

  sendResponse(res, {
    success: true,
    statusCode: 201,
    message: "Brands retrieved successfully",
    data: result,
  });
});
const getTalentWiseBrands = catchAsync(async (req, res) => {
  const result = await brandService.getTalentWiseBrandsFromDB(req.user.id);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Brands retrieved successfully",
    data: result,
  });
});
const getBrandDetails = catchAsync(async (req, res) => {
  const result = await brandService.getBrandDetailsFromDb(req.params.id);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Brands details got successfully",
    data: result,
  });
});
const getTopBrands = catchAsync(async (req, res) => {
  const result = await brandService.getTopBrandsFromDB(
    req.query.brandName as string
  );

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: `Top ${req.query.brandName} brands retrieved successfully`,
    data: result,
  });
});

export const brandController = {
  createBrand,
  getBrands,
  getTalentWiseBrands,
  getBrandDetails,
  getTopBrands,
};
