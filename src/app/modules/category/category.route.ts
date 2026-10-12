import express from "express";
import { fileUploader } from "../../../helpers/fileUploadHelper";
import { parseBodyData } from "../../middlewares/parseBodyData";
import { categoryController } from "./category.controller";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";

const router = express.Router();

router.post(
  "/create",
  auth(UserRole.ADMIN),
  fileUploader.uploadMultiple,
  parseBodyData,
  categoryController.createCategory
);
router.get("/", categoryController.getCategories);
router.get("/:id", categoryController.getCategory);

export const categoryRoutes = router;
