import admin from "firebase-admin";
import { serviceAccount } from "../app/routes/serviceAccount";

if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount as any),
    });
  } catch (e) {
    console.warn("Firebase admin initialization failed or missing credentials:", e);
  }
}

export default admin;
