import type { UserRole } from "@/models";

export interface AuthUser {
  id: string;
  roles: UserRole[];
  isVerified: boolean;
}
