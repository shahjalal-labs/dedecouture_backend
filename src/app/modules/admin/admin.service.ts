import { UserRole } from "@prisma/client";
import prisma from "../../../shared/prisma";

const getBrandAnalysisReport = async () => {
  const totalBrand = await prisma.brand.count();
  const fashionBrand = await prisma.brand.count({
    where: { category: { categoryName: "Fashion" } },
  });
  const musicBrand = await prisma.brand.count({
    where: { category: { categoryName: "Music" } },
  });
  const beautyBrand = await prisma.brand.count({
    where: { category: { categoryName: "Beauty" } },
  });
  return {
    totalBrand,
    fashionBrand,
    musicBrand,
    beautyBrand,
  };
};

const getMonthwiseBrandReport = async () => {
  const brands = await prisma.brand.findMany({
    select: {
      createdAt: true,
    },
  });

  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const monthData = monthNames.map((m) => ({
    month: m,
    brand: 0,
    displayMonth: m,
  }));

  brands.forEach((brand) => {
    const monthIndex = brand.createdAt.getMonth();
    monthData[monthIndex].brand += 1;
  });

  return monthData;
};

const getAllUsersFromDB = async (
  page: number = 1,
  search?: string,
  role?: UserRole
) => {
  const pageSize = 15; 
  const whereCondition: any = {};

  if (search) {
    whereCondition.userName = {
      contains: search,
      mode: "insensitive",
    };
  }

  if (role) {
    whereCondition.role = role; 
  }

  const totalUsers = await prisma.user.count({
    where: whereCondition,
  });

  const totalPages = Math.ceil(totalUsers / pageSize);

  const users = await prisma.user.findMany({
    where: whereCondition,
    select: {
      id: true,
      userName: true,
      profileImage: true,
      role: true,
      phone: true,
    },
    skip: (page - 1) * pageSize, 
    take: pageSize,          
    orderBy: {
      createdAt: "desc",
    },
  });

  return {
    meta: {
      totalUsers,
      totalPages,
      currentPage: page,
      pageSize, 
    },
    users,
  };
};

const getAllBrandsFromDB = async (
  page: number = 1,
  search?: string,
  category?: string
) => {
  const pageSize = 5; // ✅ items per page
  const whereCondition: any = {};

  if (search) {
    whereCondition.brandName = {
      contains: search,
      mode: "insensitive",
    };
  }

  if (category) {
    whereCondition.category = {
      categoryName: {
        equals: category,
        mode: "insensitive",
      },
    };
  }

  const totalBrands = await prisma.brand.count({
    where: whereCondition,
  });

  const totalPages = Math.ceil(totalBrands / pageSize);

  const brands = await prisma.brand.findMany({
    where: whereCondition,
    select: {
      id: true,
      brandName: true,
      mediaUrls: true,
      description: true,
      avgRating: true,
      category: {
        select: {
          categoryName: true,
        },
      },
    },
    skip: (page - 1) * pageSize, // ✅ properly skipping based on page
    take: pageSize,             // ✅ consistent page size
    orderBy: {
      createdAt: "desc",
    },
  });

  return {
    meta: {
      totalBrands,
      totalPages,
      currentPage: page,
      pageSize, // optional: include so frontend knows
    },
    brands,
  };
};

const getAllReviewsFromDB = async (
  page: number = 1,
  search?: string,
  category?: string
) => {
  const pageSize = 15; 
  const whereCondition: any = {};

  if (search) {
    whereCondition.OR = [
      {
        comment: {
          contains: search,
          mode: "insensitive",
        },
      },
      {
        brand: {
          brandName: {
            contains: search,
            mode: "insensitive",
          },
        },
      },
    ];
  }

  if (category) {
    whereCondition.brand = {
      category: {
        categoryName: {
          equals: category,
          mode: "insensitive",
        },
      },
    };
  }

  const totalReviews = await prisma.review.count({
    where: whereCondition,
  });

  const totalPages = Math.ceil(totalReviews / pageSize);

  const reviews = await prisma.review.findMany({
    where: whereCondition,
    select: {
      id: true,
      comment: true,
      rating: true,
      createdAt: true,
      user: {
        select: {
          userName: true,
          profileImage: true,
        },
      },
      brand: {
        select: {
          id: true,
          brandName: true,
          category: {
            select: {
              categoryName: true,
            },
          },
        },
      },
    },
    skip: (page - 1) * pageSize, // ✅ consistent skip
    take: pageSize,              // ✅ consistent page size
    orderBy: {
      createdAt: "desc",
    },
  });

  return {
    meta: {
      totalReviews,
      totalPages,
      currentPage: page,
      pageSize, // optional: include for frontend
    },
    reviews,
  };
};
const getAllPostsFromDB = async (page: number = 1, search?: string) => {
  const whereCondition: any = {};

  if (search) {
    whereCondition.postBody = {
      contains: search,
      mode: "insensitive",
    };
  }

  const totalPosts = await prisma.post.count({
    where: whereCondition,
  });

  const totalPages = Math.ceil(totalPosts / 3);

  const posts = await prisma.post.findMany({
    where: whereCondition,
    select: {
      id: true,
      postBody: true,
      mediaUrls: true,
      likes: true,
      _count: {
        select: {
          comment: true,
        },
      },
      user: {
        select: {
          userName: true,
          profileImage: true,
        },
      },
    },
    skip: (page - 1) * 3, // pagination
    take: 15,              // limit
    orderBy: {
      createdAt: "desc",
    },
  });

  return {
    meta: {
      totalPosts,
      totalPages,
      currentPage: page,
    },
    posts,
  };
};


const getMonthWisePositiveNegativeReview = async () => {
  const reviews = await prisma.review.findMany({
    select: {
      rating: true,
      createdAt: true,
    },
  });

  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const result: Record<string, { positive: number; negative: number }> = {};

  reviews.forEach((review) => {
    const monthIndex = review.createdAt.getMonth(); // 0-11
    const month = monthNames[monthIndex];

    if (!result[month]) {
      result[month] = { positive: 0, negative: 0 };
    }

    if (review.rating > 3) {
      result[month].positive += 1;
    } else {
      result[month].negative += 1;
    }
  });

  return Object.entries(result).map(([month, counts]) => ({
    month,
    positive: counts.positive,
    negative: counts.negative,
  }));
};

export const adminServices = {
  getBrandAnalysisReport,
  getMonthwiseBrandReport,
  getAllUsersFromDB,
  getAllBrandsFromDB,
  getAllReviewsFromDB,
  getAllPostsFromDB,
  getMonthWisePositiveNegativeReview
};
