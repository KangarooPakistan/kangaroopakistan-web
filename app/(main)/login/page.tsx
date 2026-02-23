"use client";
import React, { useEffect, useState } from "react";
import { EyeOff, Eye, Loader2 } from "lucide-react";

import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { signIn } from "next-auth/react";
import Link from "next/link";

const Login = () => {
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const router = useRouter();
  const formSchema = z.object({
    email: z.string().email({
      message: "Email is required",
    }),
    password: z.string(),
  });
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });
  const isLoading = form.formState.isSubmitting || isSigningIn;
  
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSigningIn(true);
    setError("");
    
    try {
      const result = await signIn("credentials", {
        ...values,
        redirect: false,
      });
      
      if (result?.error) {
        setError(result.error);
      } else {
        setError("");
        setSuccess("Sign in successful! Redirecting...");
        router.refresh();
        router.push("/dashboard");
        router.refresh();
      }
    } catch (error) {
      console.error("Sign in error:", error);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsSigningIn(false);
    }
  };
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  const handleClick = () => {
    router.push("https://www.kangaroopakistan.org/");
  };
  return (
    <section className="bg-white">
      <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto h-screen lg:py-0">
        <div className="w-full bg-white rounded-lg shadow-2xl md:mt-0 sm:max-w-md xl:p-0">
          <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
            <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl">
              Sign in to your account
            </h1>
            {error && (
              <span className="flex justify-center text-sm text-red-700">
                {error}
              </span>
            )}
            {success && (
              <span className="flex justify-center text-sm text-green-700">
                {success}
              </span>
            )}
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4 md:space-y-6">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="label">Email</FormLabel>
                      <FormControl>
                        <Input
                          disabled={isLoading}
                          className="input"
                          placeholder="Enter your email"
                          {...field}
                        />
                      </FormControl>

                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="label">Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showPassword ? "text" : "password"}
                            disabled={isLoading}
                            className="input pl-10" // Adjust padding to accommodate the icon
                            placeholder="Enter your password"
                            {...field}
                          />
                          {showPassword ? (
                            <Eye
                              className="absolute top-3 right-3 cursor-pointer"
                              onClick={togglePasswordVisibility}
                            />
                          ) : (
                            <EyeOff
                              className="absolute top-3 right-3 cursor-pointer"
                              onClick={togglePasswordVisibility}
                            />
                          )}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex items-center justify-center mt-6">
                  <Button
                    type="submit"
                    disabled={isLoading}
                    variant="default"
                    className="px-4 min-w-[100px]">
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Signing In...
                      </>
                    ) : (
                      "Sign In"
                    )}
                  </Button>
                  <Button
                    type="button"
                    onClick={handleClick}
                    disabled={isLoading}
                    variant="default"
                    className="px-4 ml-3">
                    Back to website
                  </Button>
                </div>
                <p className="text-sm font-light text-gray-500 w-full text-center">
                  <Link
                    className="font-medium text-blue-600 hover:underline"
                    href="/reset-password">
                    Forgot password? &nbsp;
                  </Link>
                </p>
                <p className="text-sm font-light text-gray-500 w-full text-center">
                  Dont have an account? &nbsp;
                  <Link
                    className="font-medium text-blue-600 hover:underline"
                    href="/register">
                    Sign up here
                  </Link>
                </p>
                <p className="text-sm font-light text-gray-500 w-full text-center">
                  {/* Dont have an account? &nbsp; */}
                  <Link
                    className="font-medium text-blue-600 hover:underline"
                    href="/results">
                    View Your Result
                  </Link>
                </p>
              </form>
            </Form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Login;
