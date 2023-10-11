import { z } from "zod";

export const UserSchema = z
  .object({
    id: z.number().int().min(0, "Id can't be empty"),
    firstName: z.string().nonempty("First name can't be empty"),
    lastName: z.string().nonempty("Last name can't be empty"),
    login: z.string().nonempty("Login can't be empty"),
    email: z.string().nonempty("Email can't be empty"),
    age: z
      .number()
      .int()
      .min(0, "Age can't be empty")
      .max(120, "Age must be less than or equal to 120"),
    password: z
      .string()
      .nonempty("Password can't be empty")
      .min(3, "Password must be 3 characters or more"),
    confirmPassword: z
      .string()
      .nonempty("Confirm Password can't be empty")
      .min(3, "Confirm Password must be 3 characters or more"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "The passwords do not match",
    path: ["confirmPassword"],
  })

export type User = z.infer<typeof UserSchema>;
