"use client";
import React, { useState } from "react";
import * as z from "zod";
import axios from "axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { EyeOff, Eye } from "lucide-react";
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
  schoolName: z.string().refine((data) => data.trim() !== "", {
    message: "School Name cannot be empty",
  }),
  contactNumber: z.string().refine((data) => data.trim() !== "", {
    message: "Phone number cannot be empty",
  }),
  // .regex(/^\d{3}-\d{7}$/, "Phone number must be in the format 051-5194964"),

  district: z.string().refine((data) => data.trim() !== "", {
    message: "District cannot be empty",
  }),
  tehsil: z.string().refine((data) => data.trim() !== "", {
    message: "Tehsil cannot be empty",
  }),
  fax: z.string(),
  bankTitle: z.string().refine((data) => data.trim() !== "", {
    message: "BankTitle cannot be empty",
  }),
  p_fName: z.string().refine((data) => data.trim() !== "", {
    message: "Principal's First Name cannot be empty",
  }),
  p_lName: z.string().refine((data) => data.trim() !== "", {
    message: "Principal's last name cannot be empty",
  }),
  p_contact: z.string().refine((data) => data.trim() !== "", {
    message: "Phone number cannot be empty",
  }),
  // .regex(/^\d{4}-\d{7}$/, "Phone number must be in the format 0333-5194964"),
  p_phone: z.string().refine((data) => data.trim() !== "", {
    message: "Phone number cannot be empty",
  }),

  // .regex(/^\d{3}-\d{7}$/, "Phone number must be in the format 051-5194964"),

  p_email: z.string().refine((data) => data.trim() !== "", {
    message: "Principal's email cannot be empty",
  }),
  c_fName: z.string().refine((data) => data.trim() !== "", {
    message: "Coordinator's firstname cannot be empty",
  }),
  c_lName: z.string().refine((data) => data.trim() !== "", {
    message: "Coordinator's last name cannot be empty",
  }),
  c_contact: z.string().refine((data) => data.trim() !== "", {
    message: "Phone number cannot be empty",
  }),
  // .regex(/^\d{4}-\d{7}$/, "Phone number must be in the format 0333-5194964"),
  c_phone: z.string().refine((data) => data.trim() !== "", {
    message: "Phone number cannot be empty",
  }),
  // .regex(/^\d{3}-\d{7}$/, "Phone number must be in the format 051-5194964"),
  c_email: z
    .string()
    .email()
    .refine((data) => data.trim() !== "", {
      message: "Coordinator's email cannot be empty",
    }),
  c_accountDetails: z.string().refine((data) => data.trim() !== "", {
    message: "Coordinator's account details cannot be empty",
  }),
  schoolAddress: z.string().refine((data) => data.trim() !== "", {
    message: "School Adress cannot be empty",
  }),
  // At least one special character
});

const UserRegister = () => {
  const [showPassword, setShowPassword] = useState(false);

  const router = useRouter();
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      schoolName: "",
      contactNumber: "",
      district: "",
      tehsil: "",
      fax: "",
      bankTitle: "",
      p_fName: "",
      schoolAddress: "",
      p_lName: "",
      p_contact: "",
      p_phone: "",
      p_email: "",
      c_fName: "",

      c_lName: "",
      c_contact: "",
      c_phone: "",
      c_email: "",
      c_accountDetails: "",
    },
  });
  const isLoading = form.formState.isSubmitting;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const payload = {
        ...values, // Spread the form values
        role: "User", // Add the additional string
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
        <div className=" pt-10 h-screen grid grid-cols-1 md:grid-cols-2 gap-2 xl:gap-0">
          <div className="w-full rounded-lg shadow-2xl md:mt-0 sm:max-w-md xl:p-0 mx-auto">
            <div className="p-6 space-y-3 md:space-y-6 sm:p-8">
              <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl ">
                Create account
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
                  <FormField
                    control={form.control}
                    name="schoolName"
                    render={({ field }) => (
                      <FormItem className="">
                        <FormLabel className="label mt-5">
                          School Name
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="text"
                            disabled={isLoading}
                            className="input"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="schoolAddress"
                    render={({ field }) => (
                      <FormItem className="">
                        <FormLabel className="label mt-5">
                          School Address
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="text"
                            disabled={isLoading}
                            className="input"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="contactNumber"
                    render={({ field }) => (
                      <FormItem className="">
                        <FormLabel className="label mt-5">
                          Contact Number
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="text"
                            placeholder="051-1234567"
                            disabled={isLoading}
                            className="input"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="district"
                    render={({ field }) => (
                      <FormItem className="">
                        <FormLabel className="label mt-5">
                          District Code
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="text"
                            disabled={isLoading}
                            className="input"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="tehsil"
                    render={({ field }) => (
                      <FormItem className="">
                        <FormLabel className="label mt-5">Tehsil</FormLabel>
                        <FormControl>
                          <Input
                            type="text"
                            disabled={isLoading}
                            className="input"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="fax"
                    render={({ field }) => (
                      <FormItem className="">
                        <FormLabel className="label mt-5">Fax</FormLabel>
                        <FormControl>
                          <Input
                            type="text"
                            disabled={isLoading}
                            className="input"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="bankTitle"
                    render={({ field }) => (
                      <FormItem className="">
                        <FormLabel className="label mt-5">
                          OFFICIAL BANK TITLE OF THE INSTITUTION&apos;s BANK
                          ACCOUNT FOR HONORARIUM
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="text"
                            disabled={isLoading}
                            className="input"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="p_fName"
                    render={({ field }) => (
                      <FormItem className="">
                        <FormLabel className="label mt-5">
                          Principal&apos;s First Name
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="text"
                            disabled={isLoading}
                            className="input"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="p_lName"
                    render={({ field }) => (
                      <FormItem className="">
                        <FormLabel className="label mt-5">
                          Principal&apos;s Last Name
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="text"
                            disabled={isLoading}
                            className="input"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="p_contact"
                    render={({ field }) => (
                      <FormItem className="">
                        <FormLabel className="label mt-5">
                          Principal&apos;s Cell #
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="text"
                            placeholder="0333-1234567"
                            disabled={isLoading}
                            className="input"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="p_phone"
                    render={({ field }) => (
                      <FormItem className="">
                        <FormLabel className="label mt-5">
                          Principal&apos;s Phone Number
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="051-1234567"
                            type="text"
                            disabled={isLoading}
                            className="input"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="p_email"
                    render={({ field }) => (
                      <FormItem className="">
                        <FormLabel className="label mt-5">
                          Principal&apos;s Email
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="text"
                            disabled={isLoading}
                            className="input"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="c_fName"
                    render={({ field }) => (
                      <FormItem className="">
                        <FormLabel className="label mt-5">
                          Coordinator&apos;s first Name
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="text"
                            disabled={isLoading}
                            className="input"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="c_lName"
                    render={({ field }) => (
                      <FormItem className="">
                        <FormLabel className="label mt-5">
                          Coordinator&apos;s Last Name
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="text"
                            disabled={isLoading}
                            className="input"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="c_contact"
                    render={({ field }) => (
                      <FormItem className="">
                        <FormLabel className="label mt-5">
                          Coordinator&apos;s Cell #
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="text"
                            placeholder="0333-1234567"
                            disabled={isLoading}
                            className="input"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="c_phone"
                    render={({ field }) => (
                      <FormItem className="">
                        <FormLabel className="label mt-5">
                          Coordinator&apos;s Phone number
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="text"
                            placeholder="051-1234567"
                            disabled={isLoading}
                            className="input"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="c_email"
                    render={({ field }) => (
                      <FormItem className="">
                        <FormLabel className="label mt-5">
                          Coordinator&apos;s Email
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="text"
                            disabled={isLoading}
                            className="input"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="c_accountDetails"
                    render={({ field }) => (
                      <FormItem className="">
                        <FormLabel className="label mt-5">
                          Coordinator&apos;s Account Details
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="text"
                            disabled={isLoading}
                            className="input"
                            {...field}
                          />
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
        </div>
      </section>

      <ToastContainer />
    </>
  );
};

export default UserRegister;
