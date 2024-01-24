import * as z from "zod";

export const NewPasswordSchema = z.object({
    password: z.string().min(6, {message: "Minimum 6 characters required"}),
});

export const ResetSchema = z.object({
    email: z.string({invalid_type_error: "Must be a string"}).email({ message: "Please enter a valid email"}),
});

export const LoginSchema = z.object({
    email: z.string({invalid_type_error: "Must be a string"}).email({ message: "Please enter a valid email"}),
    password: z.string().min(1, {message: "Password is required"})
});

export const RegisterSchema = z.object({
    email: z.string({invalid_type_error: "Must be a string"}).email({ message: "Please enter a valid email"}),
    password: z.string().min(6, {message: "Minimum 6 characters required"}),
    name: z.string().min(1, {message: "Name is required"})
});