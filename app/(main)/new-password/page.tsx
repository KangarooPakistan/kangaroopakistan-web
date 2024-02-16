"use client";
import React, { useEffect, useState } from "react";
import { EyeOff, Eye } from "lucide-react";

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
import Link from "next/link";

const ResetPassword = () => {
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const formSchema = z
    .object({
      newpassword: z
        .string()
        .min(8, "Password must be at least 8 characters long") // Minimum length
        .regex(/[A-Z]/, "Password must contain at least one uppercase letter") // At least one uppercase letter
        .regex(/[a-z]/, "Password must contain at least one lowercase letter") // At least one lowercase letter
        .regex(/[0-9]/, "Password must contain at least one number") // At least one number
        .regex(
          /[^A-Za-z0-9]/,
          "Password must contain at least one special character"
        ), // At least one special character
      repeatnewpassword: z.string(),
    })
    .refine((data) => data.newpassword === data.repeatnewpassword, {
      message: "Passwords do not match", // Custom error message
      path: ["repeatnewpassword"], // Field that triggers the error
    });

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      newpassword: "",
      repeatnewpassword: "",
    },
  });
  const isLoading = form.formState.isSubmitting;
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    console.log(values);
  };

  return (
    <section className="bg-white">
      <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto h-screen lg:py-0">
        <div className="w-full bg-white rounded-lg shadow-2xl md:mt-0 sm:max-w-md xl:p-0">
          <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
            <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl">
              Reset your password
            </h1>
            {error && (
              <span className="flex justify-center text-sm text-red-700">
                {error}
              </span>
            )}
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4 md:space-y-6"
              >
                <FormField
                  control={form.control}
                  name="newpassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="label">Password</FormLabel>
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
                  name="repeatnewpassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="label">Password</FormLabel>
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
                <div className="flex items-center justify-center mt-6">
                  <Button
                    type="submit"
                    disabled={isLoading}
                    variant="default"
                    className="px-4"
                  >
                    Sign In
                  </Button>
                </div>
                <p className="text-sm font-light text-gray-500 w-full text-center">
                  Need to sign in? &nbsp;
                  <Link
                    className="font-medium text-blue-600 hover:underline"
                    href="/"
                  >
                    Sign In
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

export default ResetPassword;
