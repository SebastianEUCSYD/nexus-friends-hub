import { z } from "zod";

// File validation constants
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

// File validation helper
export const validateImageFile = (file: File): { valid: boolean; error?: string } => {
  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, error: "Fil er for stor (max 5MB)" };
  }
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return { valid: false, error: "Ugyldig filtype (kun JPEG, PNG, WebP, GIF)" };
  }
  return { valid: true };
};

// Profile validation schema
export const profileSchema = z.object({
  name: z.string().trim().min(1, "Navn er påkrævet").max(50, "Navn må maks være 50 tegn"),
  username: z.string()
    .regex(/^[a-zA-Z0-9_]*$/, "Brugernavn må kun indeholde bogstaver, tal og underscore")
    .min(3, "Brugernavn skal være mindst 3 tegn")
    .max(20, "Brugernavn må maks være 20 tegn")
    .optional()
    .or(z.literal("")),
  bio: z.string().trim().max(200, "Bio må maks være 200 tegn").optional().or(z.literal("")),
  city: z.string().trim().max(50, "By må maks være 50 tegn").optional().or(z.literal("")),
  birthday: z.string().optional(),
  gender: z.enum(["Mand", "Kvinde", "Andet"]).optional(),
});

// Message validation schema
export const messageSchema = z.object({
  content: z.string().trim().min(1, "Besked kan ikke være tom").max(2000, "Besked må maks være 2000 tegn"),
});

// Auth validation schema
export const authSchema = z.object({
  email: z.string().trim().email("Ugyldig email"),
  password: z.string().min(6, "Adgangskode skal være mindst 6 tegn"),
});

export type ProfileInput = z.infer<typeof profileSchema>;
export type MessageInput = z.infer<typeof messageSchema>;
export type AuthInput = z.infer<typeof authSchema>;
