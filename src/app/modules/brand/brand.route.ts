import express from "express";
import { fileUploader } from "../../../helpers/fileUploadHelper";
import { parseBodyData } from "../../middlewares/parseBodyData";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";
import { brandController } from "./brand.controller";

const router = express.Router();

router.post(
  "/create",
  auth(UserRole.TALENT),
  fileUploader.uploadMultiple,
  parseBodyData,
  brandController.createBrand
);
router.get("/all", brandController.getBrands);

router.get(
  "/talent-wise",
  auth(UserRole.TALENT),
  brandController.getTalentWiseBrands
);
router.get("/details/:id", brandController.getBrandDetails);
router.get("/top", brandController.getTopBrands);

export const brandRoutes = router;
