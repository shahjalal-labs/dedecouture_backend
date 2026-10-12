import express from "express";
import auth from "../../middlewares/auth";
import { commentController } from "./comment.controller";

const router = express.Router();

router.post("/create", auth(), commentController.createComment);
router.post("/reply/create", auth(), commentController.createReply);

export const commentRoutes = router;
