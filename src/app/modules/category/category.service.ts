import { Request } from "express";
import { uploadInSpace } from "../../../shared/UploadHelper";
import prisma from "../../../shared/prisma";
import ApiError from "../../../errors/ApiErrors";

const createCategoryIntoDB = async (req: Request) => {
  const payload = req.body;
  const existingCategory = await prisma.category.findUnique({
    where: { categoryName: payload.categoryName },
  });

  if (existingCategory) {
    throw new ApiError(409, "This category already exists");
  }
  const files = req.files as { [fieldname: string]: Express.Multer.File[] };

  const processImages = async (
    files: Express.Multer.File[],
    folder: string
  ) => {
    if (!files || files.length === 0) return null;
    return Promise.all(
      files.map((file) => uploadInSpace(file, `category/class/${folder}`))
    );
  };

  const [categoryIcon] = await Promise.all([
    processImages(files?.categoryIcon, "categoryIcon"),
  ]);

  if (!categoryIcon) {
    throw new ApiError(404, "Category icon is required");
  }

  const category = await prisma.category.create({
    data: {
      ...payload,
      categoryIcon: categoryIcon?.[0] && categoryIcon[0],
    },
  });
  return category;
};

const getCategoriesFromDB = async () => {
  const categories = await prisma.category.findMany();

  return categories;
};

const getSingleCategoryBrandsFromDB = async (categoryId: string) => {
  const category = await prisma.category.findUnique({
    where: { id: categoryId },
    select: {
      id: true,
      categoryName: true,
      Brand: {
        select: {
          id: true,
          brandName: true,
          mediaUrls: true,
          avgRating: true,
          totalReview: true,
          description: true,
        },
      },
    },
  });
  if (!category) {
    throw new ApiError(404, "category not found");
  }
  return category;
};

export const categoryService = {
  createCategoryIntoDB,
  getCategoriesFromDB,
  getSingleCategoryBrandsFromDB,
};
