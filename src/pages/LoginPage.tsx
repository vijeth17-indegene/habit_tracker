import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {loginSchema, type LoginFormValues} from "../lib/schemas/auth";
import { supabase } from "../lib/supabase";
import { Link } from "react-router";

import {
  mainClassName,
  mainHeading,
  labelClassName,
  inputClassName,
  errorMessage,
  serverErrorMessage,
  submitButton
} from "../lib/authStyles";


export default function LoginPage() {

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    mode: "onBlur",
    shouldFocusError: true,
    defaultValues: { email: "", password: ""},
  });

  const onSubmit = async({email, password}: LoginFormValues) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError("root.server", { message: error.message });
      return;
    }
  }

  return (
    <main className={mainClassName}>
      <h1 className={mainHeading}>Login</h1>
      <form noValidate onSubmit={handleSubmit(onSubmit)}>
        <div className="mb-5">
          <label className={labelClassName} htmlFor="email">Email</label>
            <input
              className={inputClassName}
              id="email"
              type="email"
              autoComplete="email"
              aria-invalid={errors.email ? "true" : "false"}
              aria-describedby={errors.email ? "email-error" : undefined}
              {...register("email")}
            />
            {errors.email && <p className={errorMessage} id="email-error">{errors.email.message}</p>}
        </div>
        <div className="mb-5">
          <label className={labelClassName} htmlFor="password">Password</label>
            <input
              className={inputClassName}
              id="password"
              type="password"
              autoComplete="current-password"
              aria-invalid={errors.password ? "true" : "false"}
              aria-describedby={errors.password ? "password-error" : undefined}
              {...register("password")}
            />
            {errors.password && <p className={errorMessage} id="password-error">{errors.password.message}</p>}
        </div>
        {errors.root?.server && (
          <p className={serverErrorMessage} role="alert">{errors.root.server.message}</p>
        )}
        <button className={submitButton} type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Signing in..." : "Login"}
        </button>
      </form>
      <p className="mt-4 text-sm">
        Don't have an account?{" "}
        <Link to="/signup" className="text-blue-800 underline">
          Sign up
        </Link>
      </p>
    </main>
  )
}