"use client";
import React from "react";
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
  schoolId: z.string({
    required_error: "School Id is required",
  }),
  schoolName: z.string(),
  contactNumber: z
    .string()
    .regex(/^\d{3}-\d{7}$/, "Phone number must be in the format 051-5194964")
    .optional()
    .or(z.literal("")),
  district: z.string(),
  tehsil: z.string(),
  fax: z.string(),
  bankTitle: z.string(),
  p_fName: z.string(),
  p_mName: z.string(),
  p_lName: z.string(),
  p_contact: z
    .string()
    .regex(/^\d{4}-\d{7}$/, "Phone number must be in the format 0333-5194964")
    .optional()
    .or(z.literal("")),
  p_phone: z
    .string()
    .regex(/^\d{3}-\d{7}$/, "Phone number must be in the format 051-5194964")
    .optional()
    .or(z.literal("")),
  p_email: z.string(),
  c_fName: z.string(),
  c_mName: z.string(),
  c_lName: z.string(),
  c_contact: z
    .string()
    .regex(/^\d{4}-\d{7}$/, "Phone number must be in the format 0333-5194964")
    .optional()
    .or(z.literal("")),
  c_phone: z
    .string()
    .regex(/^\d{3}-\d{7}$/, "Phone number must be in the format 051-5194964")
    .optional()
    .or(z.literal("")),
  c_email: z.string().email().optional().or(z.literal("")),
  c_accountDetails: z.string(),

  // At least one special character
});
const UserRegister = () => {
  const router = useRouter();
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      schoolId: "",
      schoolName: "",
      contactNumber: "",
      district: "",
      tehsil: "",
      fax: "",
      bankTitle: "",
      p_fName: "",
      p_mName: "",
      p_lName: "",
      p_contact: "",
      p_phone: "",
      p_email: "",
      c_fName: "",
      c_mName: "",
      c_lName: "",
      c_contact: "",
      c_phone: "",
      c_email: "",
      c_accountDetails: "",
    },
  });
  const isLoading = form.formState.isSubmitting;
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    console.log(values);
    try {
      const payload = {
        ...values, // Spread the form values
        role: "User", // Add the additional string
      };
      console.log(payload);
      await axios.post("/api/users/signup", payload);
      form.reset();
      router.push("/dashboard");
    } catch (error) {
      console.log(error);
    }
  };
  return (
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
                        <Input
                          type="password"
                          disabled={isLoading}
                          className="input"
                          placeholder="Enter your password"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="schoolId"
                  render={({ field }) => (
                    <FormItem className="">
                      <FormLabel className="label mt-5">School ID</FormLabel>
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
                  name="schoolName"
                  render={({ field }) => (
                    <FormItem className="">
                      <FormLabel className="label mt-5">School Name</FormLabel>
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
                  name="p_mName"
                  render={({ field }) => (
                    <FormItem className="">
                      <FormLabel className="label mt-5">
                        Principal&apos;s Middle Name
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
                        Principal&apos;s Contact
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
                  name="c_mName"
                  render={({ field }) => (
                    <FormItem className="">
                      <FormLabel className="label mt-5">
                        Coordinator&apos;s Middle Name
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
                        Coordinator&apos;s Contact number
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
  );
};

export default UserRegister;
