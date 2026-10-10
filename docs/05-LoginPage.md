## 1) 

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {loginSchema, type LoginFormValues} from "../lib/schemas/auth";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router";


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

  const navigate = useNavigate();

  const onSubmit = async({email, password}: LoginFormValues) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError("root.server", { message: error.message });
      return;
    }
    navigate("/");
  }

  return (
    <main>
      <h1>Login</h1>
      <form noValidate onSubmit={handleSubmit(onSubmit)}>
        <div className="mb-5">
          <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              aria-invalid={errors.email ? "true" : "false"}
              aria-describedby={errors.email ? "email-error" : undefined}
              {...register("email")}
            />
            {errors.email && <p id="email-error">{errors.email.message}</p>}
        </div>
        <div className="mb-5">
          <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              aria-invalid={errors.password ? "true" : "false"}
              aria-describedby={errors.password ? "password-error" : undefined}
              {...register("password")}
            />
            {errors.password && <p id="password-error">{errors.password.message}</p>}
        </div>
        {errors.root?.server && (
          <p role="alert">{errors.root.server.message}</p>
        )}
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Signing in..." : "Login"}
        </button>
      </form>
    </main>
  )
}

## 2) Link the pages together: "Don't have an account? Sign up" on login, and "Already have an account? Log in" on signup

import { Link, useNavigate } from "react-router";

<p className="mt-4 text-sm">
  Don't have an account?{" "}
  <Link to="/signup" className="text-blue-800 underline">
    Sign up
  </Link>
</p>


•	Log in with the wrong password. Supabase's error says "Invalid login credentials" without revealing whether the email or the password was wrong. That's deliberate, so attackers can't find out which emails are registered.
•	Log in correctly, then open DevTools → Application → Local Storage. You'll find a key starting with sb- that contains your access_token and refresh_token. That's the session from the auth lesson, stored by supabase-js.