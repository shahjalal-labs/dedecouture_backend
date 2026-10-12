import express from "express";
import { adminController } from "./admin.controller";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";

const router = express.Router();


router.get(
  "/overview",
  auth(UserRole.ADMIN),
  adminController.brandAnalysisReport
);
router.get(
  "/monthly-brands",
  auth(UserRole.ADMIN),
  adminController.monthwiseBrandReport
);
router.get(
  "/monthly-review",
  auth(UserRole.ADMIN),
  adminController.getMonthWiseReviews
);
router.get("/all-users", auth(UserRole.ADMIN), adminController.getAllUsers);
router.get("/all-brands", auth(UserRole.ADMIN), adminController.getAllBrands);
router.get("/all-reviews", auth(UserRole.ADMIN), adminController.getAllReviews);
router.get("/all-posts", auth(UserRole.ADMIN), adminController.getAllPosts);

export const adminRoute = router;
