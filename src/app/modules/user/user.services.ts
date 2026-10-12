import { PendingUser, User, UserRole } from "@prisma/client";
import ApiError from "../../../errors/ApiErrors";
import bcrypt from "bcryptjs";
import { ObjectId } from "mongodb";
import { jwtHelpers } from "../../../helpers/jwtHelpers";
import config from "../../../config";
import prisma from "../../../shared/prisma";
import sendEmail from "../../../helpers/sendEmail";
import generateOTP from "../../../helpers/generateOtp";
import { emailBody } from "../../../shared/EmailTemplate";


//create new user
const createPendingUserIntoDB = async (payload: PendingUser) => {
  const existingUser = await prisma.user.findFirst({
    where: { email: payload.email },
  });
  if (existingUser) {
    throw new ApiError(409, "Email already exists!");
  }

  const hashedPassword = await bcrypt.hash(payload.password as string, 10);
  const otp = generateOTP(); // 4-digit OTP
  const OTP_EXPIRATION_TIME = 5 * 60 * 1000;
  const expiresAt = Date.now() + OTP_EXPIRATION_TIME;
  const subject = "Your Account Verification OTP";
  const html = emailBody(payload.userName, otp);

  await sendEmail(payload.email, subject, html);
  await prisma.pendingUser.upsert({
    where: {
      email: payload.email,
    },
    update: { otpCode: otp, expiresAt: new Date(expiresAt) },
    create: {
      ...payload,
      password: hashedPassword,
      otpCode: otp,
      expiresAt: new Date(expiresAt),
    },
  });

  return otp;
};

//create new user
const resendVerifyOTP = async (email: string) => {
  const existingUser = await prisma.pendingUser.findFirst({
    where: { email: email },
  });
  if (!existingUser) {
    throw new ApiError(409, "User not found!");
  }

  const otp = generateOTP();
  const OTP_EXPIRATION_TIME = 5 * 60 * 1000;
  const expiresAt = Date.now() + OTP_EXPIRATION_TIME;
  const subject = "Your Account Verification OTP";
   const html = emailBody(existingUser.userName, otp);

  await sendEmail(email, subject, html);
  await prisma.pendingUser.update({
    where: {
      email: email,
    },
    data: {
      otpCode: otp,
      expiresAt: new Date(expiresAt),
    },
  });

  return otp;
};


//create new user
const createUserIntoDB = async (email: string, otp: string) => {
  const existingUser = await prisma.user.findUnique({
    where: { email: email },
  });
  if (existingUser) {
    throw new ApiError(409, "User Already exists!");
  }

  const userPending = await prisma.pendingUser.findUnique({
    where: { email: email },
  });
  if (!userPending) {
    throw new ApiError(409, "User doesn't exist!");
  }

  const { otpCode, expiresAt, userName } = userPending;

  if (otp !== otpCode) {
    throw new ApiError(401, "Invalid OTP.");
  }

  if (Date.now() > expiresAt.getTime()) {
    await prisma.pendingUser.delete({
      where: {
        email: userPending.email,
      },
    }); // OTP has expired
    throw new ApiError(410, "OTP has expired. Please request a new OTP.");
  }

  // OTP is valid
  await prisma.pendingUser.delete({
    where: {
      email: email,
    },
  });
 

  const user = await prisma.user.create({
    data: {
      email: email,
      password: userPending.password,
      userName: userName,     
      fcmToken: userPending.fcmToken,    
      role: userPending.role as UserRole,
    },
  });

  const accessToken = jwtHelpers.generateToken(
    {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    config.jwt.jwt_secret as string,
    config.jwt.expires_in as string
  );

  const { password, ...sanitizedUser } = user;

  return {
    accessToken,
    userInfo: sanitizedUser,
  };
};


//get single user
const getSingleUserIntoDB = async (id: string) => {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) {
    throw new ApiError(404, "user not found!");
  }

  const { password, ...sanitizedUser } = user;
  return sanitizedUser;
};

//get all users
const getUsersIntoDB = async () => {
  const users = await prisma.user.findMany({
    where: { role: "USER" },
    select: {
      id: true,
      userName: true,
      email: true,
      profileImage: true,
      phone: true,
      address: true,    
    },
  });
  if (users.length === 0) {
    throw new ApiError(404, "Users not found!");
  }

  return users;
};

//update user
const updateUserIntoDB = async (id: string, userData: any) => {
  if (!ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid user ID format");
  }
  const existingUser = await getSingleUserIntoDB(id);
  if (!existingUser) {
    throw new ApiError(404, "user not found for edit user");
  }
  const updatedUser = await prisma.user.update({
    where: { id },
    data: userData,
  });

  const { password, ...sanitizedUser } = updatedUser;

  return sanitizedUser;
};

//delete user
const deleteUserIntoDB = async (userId: string, loggedId: string) => {
  if (!ObjectId.isValid(userId)) {
    throw new ApiError(400, "Invalid user ID format");
  }

  if (userId === loggedId) {
    throw new ApiError(403, "You can't delete your own account!");
  }
  const existingUser = await getSingleUserIntoDB(userId);
  if (!existingUser) {
    throw new ApiError(404, "user not found for delete this");
  }
  await prisma.user.delete({
    where: { id: userId },
  });
  return;
};



export const userService = {
  createUserIntoDB,
  createPendingUserIntoDB,
  getUsersIntoDB,
  getSingleUserIntoDB,
  updateUserIntoDB,
  deleteUserIntoDB,
  resendVerifyOTP,   
};
