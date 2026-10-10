import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signUpSchema, type SignUpFormValues } from "../lib/schemas/auth";

import { supabase } from "../lib/supabase";
import { useNavigate, Link } from "react-router";

import {
  mainClassName,
  mainHeading,
  labelClassName,
  inputClassName,
  errorMessage,
  serverErrorMessage,
  submitButton
} from "../lib/authStyles";


export default function SignUpPage() {
  const {
    register,
    handleSubmit,
    setError,
    formState: {errors, isSubmitting},
  } = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    mode: "onBlur",
    shouldFocusError: true,
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: ""
    }
  });

  const navigate = useNavigate();

  const onSubmit = async ({
    fullName,
    email,
    password,
  }: SignUpFormValues) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {full_name: fullName},
      },
    });

    if (error) {
      setError("root.server", {message: error.message});
      return;
    }
    navigate("/");
  };

  return (
    <main className={mainClassName}>
      <h1 className={mainHeading}>Sign Up</h1>

      <form noValidate onSubmit={handleSubmit(onSubmit)}>
        <div className="mb-5">
          <label className={labelClassName} htmlFor="fullName">Full Name</label>
          <input 
            type="text" 
            id="fullName"
            autoComplete="name"
            aria-invalid={errors.fullName ? "true" : "false"}
            aria-describedby={errors.fullName ? "fullName-error" : undefined}
            className={inputClassName}
            {...register("fullName")}
           />
           {errors.fullName && (
            <p className={errorMessage} id="fullName-error">{errors.fullName.message}</p>
           )}
        </div>
        <div className="mb-5">
          <label className={labelClassName} htmlFor="email">Email</label>
          <input 
            type="email"
            id="email"
            autoComplete="email"
            aria-invalid={errors.email ? "true" : "false"}
            aria-describedby={errors.email ? "email-error" : undefined}
            className={inputClassName}
            {...register("email")}
          />
          {errors.email && (
            <p className={errorMessage} id="email-error">{errors.email.message}</p>
          )}
        </div>
        <div className="mb-5">
          <label className={labelClassName} htmlFor="password">Password</label>
          <input 
            type="password"
            id="password"
            autoComplete="new-password"
            aria-invalid={errors.password ? "true" : "false"}
            aria-describedby={errors.password ? "password-error" : undefined}
            className={inputClassName}
            {...register("password")}
          />
          {errors.password && (
            <p className={errorMessage} id="password-error">{errors.password.message}</p>
          )}
        </div>
        <div className="mb-5">
          <label className={labelClassName} htmlFor="confirmPassword">Confirm Password</label>
          <input
            id="confirmPassword"
            autoComplete="new-password"
            type="password" 
            aria-invalid={errors.confirmPassword ? "true" : "false"}
            aria-describedby={errors.confirmPassword ? "confirmPassword-error" : undefined}
            className={inputClassName}
            {...register("confirmPassword")}  
          />
          {errors.confirmPassword && (
            <p className={errorMessage} id="confirmPassword-error">{errors.confirmPassword.message}</p>
          )}
        </div>


        {errors.root?.server && (
          <p className={serverErrorMessage} role="alert">{errors.root.server.message}</p>
        )}

        <button className={submitButton} type="submit" disabled={isSubmitting}>
          {isSubmitting? "Creating account..": "Create Account"}
        </button>
      </form>

      <p className="mt-4 text-sm">
        Already have an account?{" "}
        <Link to="/login" className="text-blue-800 underline">
          Log in
        </Link>
      </p>
    </main>
  );
}