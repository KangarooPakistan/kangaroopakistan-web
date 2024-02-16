"use client";
import React, { useEffect, useState } from "react";
import { EyeOff, Eye } from "lucide-react";

import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
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
import { useParams, useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import axios from "axios";

const ResetPassword = () => {
  const [error, setError] = useState("");
  const params = useParams();
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showMatchPassword, setShowMatchPassword] = useState(false);
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
    try {
      console.log(values);
      const payload = {
        token: params.token,
        password: values.newpassword,
      };
      await axios.put(`/api/change-password`, payload);
      form.reset();
      router.push("/");
      toast.success("🦄 Account successfully created", {
        position: "bottom-center",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });
    } catch (error) {
      toast.error(" " + error, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });
      console.log(error);
    }
  };
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  const togglePasswordMatchVisibility = () => {
    setShowMatchPassword(!showMatchPassword);
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
                <FormField
                  control={form.control}
                  name="repeatnewpassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="label">Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showMatchPassword ? "text" : "password"}
                            disabled={isLoading}
                            className="input pl-10" // Adjust padding to accommodate the icon
                            placeholder="Enter your password"
                            {...field}
                          />
                          {showMatchPassword ? (
                            <Eye
                              className="absolute top-3 right-3 cursor-pointer"
                              onClick={togglePasswordMatchVisibility}
                            />
                          ) : (
                            <EyeOff
                              className="absolute top-3 right-3 cursor-pointer"
                              onClick={togglePasswordMatchVisibility}
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
                    className="px-4"
                  >
                    Submit
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
