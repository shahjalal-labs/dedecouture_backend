import { Brand } from "@prisma/client";
import prisma from "../../../shared/prisma";
import { Request } from "express";
import { uploadInSpace } from "../../../shared/UploadHelper";
import ApiError from "../../../errors/ApiErrors";

const createBrandIntoDB = async (req: Request) => {
  const userId = req.user.id;
  const payload = req.body;
  const files = req.files as { [fieldname: string]: Express.Multer.File[] };

  await prisma.user.findFirstOrThrow({
    where: { id: userId, role: "TALENT" },
  });

  const existingBrand = await prisma.brand.findFirst({
    where: {
      userId,
      categoryId: payload.categoryId,
      brandName: payload.brandName,
    },
  });

  if (existingBrand) {
    throw new Error(
      "You already have a brand with this name in this category."
    );
  }

  const processImages = async (
    files: Express.Multer.File[],
    folder: string
  ) => {
    if (!files || files.length === 0) return null;
    return Promise.all(
      files.map((file) => uploadInSpace(file, `brand/class/${folder}`))
    );
  };

  const [mediaUrls] = await Promise.all([
    processImages(files?.mediaUrls, "mediaUrls"),
  ]);

  if (!mediaUrls) {
    throw new ApiError(404, "Brand images are required");
  }

  const newBrand = await prisma.brand.create({
    data: {
      ...payload,
      userId,
      mediaUrls,
    },
  });
  return newBrand;
};

const getAllBrandsFromDB = async (
  categoryId?: string,
  search?: string,
  rating?: string
) => {
  const brands = await prisma.brand.findMany({
    where: {
      ...(categoryId && { categoryId }),
      ...(search && {
        brandName: {
          contains: search,
          mode: "insensitive",
        },
      }),
      ...(rating && {
        avgRating: {
          gte: parseFloat(rating),
        },
      }),
    },
    select: {
      id: true,
      brandName: true,
      locationData: true,
      avgRating: true,
      totalReview:true,
      categoryId: true,
    },
  });

  return brands;
};

const getTalentWiseBrandsFromDB = async (talentId: string) => {
  await prisma.user.findUnique({
    where: { id: talentId },
  });

  const brands = await prisma.brand.findMany({
    where: { userId: talentId },
  });
  return brands;
};

const getBrandDetailsFromDb = async (brandId: string) => {
  const brand = await prisma.brand.findFirstOrThrow({
    where: { id: brandId },
    include: {
      user: {
        select: {
          id: true,
          profileImage: true,
          userName: true,
        },
      },
      Review: {
        select: {
          id: true,
          comment: true,
          rating: true,
          createdAt: true,
          user: {
            select: {
              id: true,
              profileImage: true,
              userName: true,
            },
          },
        },
      },
    },
  });
  if (!brand) {
    throw new ApiError(404, "Brand not found");
  }
  return brand;
};

const getTopBrandsFromDB = async (brandName: string) => {
  const topBrands = await prisma.brand.findMany({
    where: {
      category: {
        categoryName: brandName,
      },
    },
    select: {
      id: true,
      mediaUrls: true,
      avgRating: true,
      totalReview: true,
      description: true,
    },
    orderBy: {
      avgRating: "desc",
    },
    take: 4,
  });

  return topBrands;
};

export const brandService = {
  createBrandIntoDB,
  getAllBrandsFromDB,
  getTalentWiseBrandsFromDB,
  getBrandDetailsFromDb,
  getTopBrandsFromDB,
};
