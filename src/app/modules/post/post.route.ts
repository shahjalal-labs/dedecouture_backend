import express from "express";
import { postController } from "./post.controller";
import auth from "../../middlewares/auth";
import { fileUploader } from "../../../helpers/fileUploadHelper";
import { parseBodyData } from "../../middlewares/parseBodyData";
import { UserRole } from "@prisma/client";

const router = express.Router();

router.post(
  "/create",
  auth(UserRole.TALENT),
  fileUploader.uploadMultiple,
  parseBodyData,
  postController.createPost
);
router.get("/all", auth(), postController.getPosts);
router.get("/my", auth(), postController.getMyPosts);
router.get("/details/:id", auth(), postController.getPostDetails);
router.patch("/like-unlike/:id", auth(), postController.likeUnlikePost);
router.get("/likes", auth(), postController.getLikes);

router.post("/comment", auth(), postController.createComment);
router.post("/reply", auth(), postController.createReply);

export const postRoutes = router;
