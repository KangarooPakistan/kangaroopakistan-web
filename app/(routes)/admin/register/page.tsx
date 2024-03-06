"use client";
import React, { useState } from "react";
import * as z from "zod";
import axios from "axios";
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
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Eye, EyeOff } from "lucide-react";

const formSchema = z.object({
  email: z.string().email({
    message: "Email is required",
  }),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters long") // Minimum length
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter") // At least one uppercase letter
    .regex(/[a-z]/, "Password must contain at least one lowercase letter") // At least one lowercase letter
    .regex(/[0-9]/, "Password must contain at least one number") // At least one number
    .regex(
      /[^A-Za-z0-9]/,
      "Password must contain at least one special character"
    ),

  // At least one special character
});
const UserRegister = () => {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });
  const isLoading = form.formState.isSubmitting;
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const payload = {
        ...values, // Spread the form values
        role: "Admin", // Add the additional string
      };
      await axios.post("/api/users/signup", payload);
      form.reset();
      await router.push("/dashboard");
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
    }
  };
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  return (
    <>
      <section className="bg-white mb-12">
        <div className=" pt-10 grid grid-cols-1 md:grid-cols-2 gap-2 xl:gap-0">
          <div className="w-full rounded-lg shadow-2xl md:mt-0 sm:max-w-md xl:p-0 mx-auto">
            <div className="p-6 space-y-3 md:space-y-6 sm:p-8">
              <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl ">
                Create Admin Account
              </h1>

              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-4 md:space-y-6"
                >
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
                  <div className="flex items-center justify-center mt-16">
                    <Button
                      disabled={isLoading}
                      variant="default"
                      className="px-10"
                    >
                      Create
                    </Button>
                  </div>
                </form>
              </Form>
            </div>
          </div>
          <div className="xl:w-3/4 mt-20">
            <div className="bg-gray-100 py-2 px-5 rounded text-xs md:text-base mx-2 xl:mx-0">
              <h2 className="font-bold">Instructions</h2>
              <ul className="list-disc mt-4 list-inside">
                <li>Password must be at least 8 characters long.</li>
                <li>Password must contain at least one uppercase letter.</li>
                <li>Password must contain at least one lowercase letter.</li>
                <li>Password must contain at least one number.</li>
                <li>Password must contain at least one special character.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
      <ToastContainer />
    </>
  );
};

export default UserRegister;
