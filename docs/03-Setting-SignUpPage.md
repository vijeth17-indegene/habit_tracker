## 1) signupschema
import { z } from "zod";

export const signUpSchema = z
    .object({
        fullName: z.string(),
        email: z.email(),
        password: z.string(),
        confirmPassword: z.string(),
    })
    .refine((values) => values.password === values.confirmPassword, {
        path: ['confirmPassword'],
        message: "Passwords do not match",
    });

export type SignUpFormValues = z.infer<typeof signUpSchema>;

## 2) Adding validation and error messages

export const signUpSchema = z
    .object({
        fullName: z
            .string().trim()
            .min(1, "Enter your full name")
            .max(100, "Name must be 100 characters or fewer"),
        email: z.string().trim().toLowerCase()
            .pipe(z.email("Enter a valid email address")),
        password: z.string()
            .min(8, "Password must be at least 8 characters")
            .max(72, "Password must be 72 characters or fewer"),
        confirmPassword: z.string().min(1, "Please confirm your password"),
    })
    .refine((values) => values.password === values.confirmPassword, {
        path: ['confirmPassword'],
        message: "Passwords do not match",
    });

## 3) Built the form with useForm and zodResolver. Showing each field's error message under its input, and disabling the submit button while isSubmitting is true.

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signUpSchema, type SignUpFormValues } from "../lib/schemas/auth";

export default function SignUpPage() {
  const {
    register,
    handleSubmit,
    formState: {errors, isSubmitting},
  } = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    mode: "onBlur",
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: ""
    }
  });

  const onSubmit = (data: SignUpFormValues) => {
    console.log(data);
  }

  return (
    <div>
      <h1>Sign Up</h1>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div>
          <label htmlFor="fullName">Full Name</label>
          <input 
            type="text" 
            id="fullName"
            autoComplete="name"
            aria-invalid={errors.fullName ? "true" : "false"}
            aria-describedby={errors.fullName ? "fullName-error" : undefined}
            {...register("fullName")}
           />
           {errors.fullName && (
            <p id="fullName-error">{errors.fullName.message}</p>
           )}
        </div>
        <div>
          <label htmlFor="email">Email</label>
          <input 
            type="email"
            id="email"
            autoComplete="email"
            aria-invalid={errors.email ? "true" : "false"}
            aria-describedby={errors.email ? "email-error" : undefined}
            {...register("email")}
          />
          {errors.email && (
            <p id="email-error">{errors.email.message}</p>
          )}
        </div>
        <div>
          <label htmlFor="password">Password</label>
          <input 
            type="password"
            id="password"
            autoComplete="new-password"
            aria-invalid={errors.password ? "true" : "false"}
            aria-describedby={errors.password ? "password-error" : undefined}
            {...register("password")}
          />
          {errors.password && (
            <p id="password-error">{errors.password.message}</p>
          )}
        </div>
        <div>
          <label htmlFor="confirmPassword">Confirm Password</label>
          <input
            id="confirmPassword"
            autoComplete="new-password"
            type="password" 
            aria-invalid={errors.confirmPassword ? "true" : "false"}
            aria-describedby={errors.confirmPassword ? "confirmPassword-error" : undefined}
            {...register("confirmPassword")}  
          />
          {errors.confirmPassword && (
            <p id="confirmPassword-error">{errors.confirmPassword.message}</p>
          )}
        </div>


        {errors.root?.server && (
          <p role="alert">{errors.root.server.message}</p>
        )}

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting? "Creating account..": "Create Account"}
        </button>
      </form>
    </div>
  );
}


## 4) On submit, call: supabase.auth.signUp({ email, password, options: { data: { full_name: fullName } }, })

Client validation is only for user experience; Supabase enforces the real rules. Its default minimum password length is lower than 8, so raise it to 8 in your Auth settings so both sides agree.

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


  Add setError to your useForm destructuring, and show {errors.root?.server && (
          <p role="alert">{errors.root.server.message}</p>
        )}
above button

root vs root.server: both work. What matters is that setError and your display use the same key. root.server is slightly better because it names where the error came from. If you later add another form-level error (say, root.network for "you're offline"), each one has its own slot. Since your JSX already reads errors.root?.server, change setError to "root.server" and you're set. Either way, React Hook Form clears root errors automatically on the next sub

