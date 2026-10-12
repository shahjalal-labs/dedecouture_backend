import express from "express";
import { userRoutes } from "../modules/user/user.route";
import { authRoute } from "../modules/auth/auth.routes";
import { categoryRoutes } from "../modules/category/category.route";
import { messageRoute } from "../modules/message/message.routes";
import { brandRoutes } from "../modules/brand/brand.route";
import { reviewRoutes } from "../modules/review/review.route";
import { postRoutes } from "../modules/post/post.route";
import { adminRoute } from "../modules/admin/admin.route";

const router = express.Router();

const moduleRoutes = [
  {
    path: "/user",
    route: userRoutes,
  },
  {
    path: "/auth",
    route: authRoute,
  },
  {
    path: "/category",
    route: categoryRoutes,
  },
  {
    path: "/brand",
    route: brandRoutes,
  },
  {
    path: "/review",
    route: reviewRoutes,
  },
  {
    path: "/post",
    route: postRoutes,
  },
  {
    path: "/message",
    route: messageRoute,
  },
  {
    path: "/admin",
    route: adminRoute,
  },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
