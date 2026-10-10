import { z } from "zod";

const emailSchema = z.string().trim().toLowerCase()
            .pipe(z.email("Enter a valid email address"));

export const signUpSchema = z
    .object({
        fullName: z
            .string().trim()
            .min(1, "Enter your full name")
            .max(100, "Name must be 100 characters or fewer"),
        email: emailSchema,
        password: z.string()
            .min(8, "Password must be at least 8 characters")
            .max(72, "Password must be 72 characters or fewer"),
        confirmPassword: z.string().min(1, "Please confirm your password"),
    })
    .refine((values) => values.password === values.confirmPassword, {
        path: ['confirmPassword'],
        message: "Passwords do not match",
    });

export type SignUpFormValues = z.infer<typeof signUpSchema>;


export const loginSchema = z.object({
    email: emailSchema,
    password: z.string().min(1, "Enter your password"),
});
export type LoginFormValues = z.infer<typeof loginSchema>;

//This type represents the shape of the data expected by the signUpSchema, including fullName, email, password, and confirmPassword, with the refinement that password and confirmPassword must match.

