import express from "express";
import { UserControllers } from "./user.controller";
import validateRequest from "../../middlewares/validateRequest";
import { userValidation } from "./user.validation";
import { UserRole } from "@prisma/client";
import auth from "../../middlewares/auth";

const router = express.Router();

router.post(
  "/request",
  validateRequest(userValidation.userRegisterValidationSchema),
  UserControllers.createPendingUser
);
router.post("/otp-resend", UserControllers.resendOTP);
router.post("/verify", UserControllers.createUser);
router.get("/", UserControllers.getUsers);
router.get("/single/:id", UserControllers.getSingleUser);
router.put(
  "/:id",
  validateRequest(userValidation.userUpdateValidationSchema),
  auth(UserRole.ADMIN),
  UserControllers.updateUser
);
router.delete("/:id", auth(UserRole.ADMIN), UserControllers.deleteUser);


export const userRoutes = router;
