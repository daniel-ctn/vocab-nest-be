import { getCurrentUser } from "../auth/auth.service";

export const getUserProfile = (userId: string) => getCurrentUser(userId);
