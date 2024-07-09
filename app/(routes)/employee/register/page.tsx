"use client";
import React, { useState } from "react";
import * as z from "zod";
import axios from "axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { EyeOff, Eye } from "lucide-react";

import { useForm, useFieldArray, Controller } from "react-hook-form";

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
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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
  role: z.string().refine((data) => data.trim() !== "", {
    message: "Role cannot be empty",
  }),
});

const UserRegister = () => {
  const [showPassword, setShowPassword] = useState(false);

  const router = useRouter();
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      role: "",
    },
  });
  const isLoading = form.formState.isSubmitting;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    console.log(values);
    try {
      const payload = {
        ...values, // Spread the form values
        // role: "Admin", // Add the additional string
      };
      console.log(payload);
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
  const handleClassChange = (cityValue: string) => {
    console.log(cityValue);
    let role = "";
    switch (cityValue) {
      case "Admin":
        role = "Admin";
        break;
      case "Employee":
        role = "Employee";
        break;
      default:
        break;
    }
    console.log(role);
    form.setValue(`role`, role);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  return (
    <>
      <section className="bg-white mb-12">
        <div className=" pt-10 h-screen grid grid-cols-1 md:grid-cols-2 gap-2 xl:gap-0">
          <div className="w-full rounded-lg shadow-2xl md:mt-0 sm:max-w-md xl:p-0 mx-auto">
            <div className="p-6 space-y-3 md:space-y-6 sm:p-8">
              <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl ">
                Create account
              </h1>

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
                      <FormItem className="">
                        <FormLabel className="label mt-5">Password</FormLabel>
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

                  <FormLabel className="label mt-5">City</FormLabel>
                  <div className="">
                    <Controller
                      name="role"
                      control={form.control}
                      render={({ field }) => (
                        <select
                          {...field}
                          onChange={(e) => {
                            field.onChange(e); // Important: update the form state
                            handleClassChange(e.target.value); // Update the level based on the class
                          }}
                          className="w-full p-2 text-xs md:text-base rounded border border-gray-300 focus:outline-none focus:border-blue-500">
                          <option value="">SELECT Role</option>
                          <option value="Admin">Admin</option>
                          <option value="Employee">Employee</option>
                        </select>
                      )}
                    />
                  </div>
                  <div className="flex items-center justify-center mt-16">
                    <Button
                      disabled={isLoading}
                      variant="default"
                      className="px-10">
                      Create
                    </Button>
                  </div>
                </form>
              </Form>
            </div>
          </div>
        </div>
      </section>

      <ToastContainer />
    </>
  );
};

export default UserRegister;
