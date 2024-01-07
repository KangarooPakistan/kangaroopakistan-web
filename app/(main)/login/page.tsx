"use client";
import * as z from "zod";
import axios from "axios";
import { Login } from "./Login";

export const formSchema = z.object({
  email: z.string().email({
    message: "Email is required",
  }),
  password: z.string(),
});
export default Login;
