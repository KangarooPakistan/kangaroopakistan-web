"use client";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import * as zod from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import "react-toastify/dist/ReactToastify.css";
import { toast, ToastContainer } from "react-toastify";
import { getSession } from "next-auth/react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const formSchema = zod.object({
  studentName: zod.string().min(1, "Student name is required"),
  fatherName: zod.string().min(1, "Father's name is required"),
  level: zod.string().min(1, "Please select level"),
  class: zod.string().min(1, "Please select class"),
});
interface Student {
  rollNumber: string;
  studentName: string;
  fatherName: string;
  level: string;
  class: string; // Changed from `class` to `studentClass`
  schoolName: string | null;
  address: string | null;
  districtCode: string | null;
  schoolId: number;
}

const initialData: Student = {
  rollNumber: "",
  studentName: "",
  fatherName: "",
  level: "",
  class: "", // Changed from `class` to `studentClass`
  schoolName: "",
  address: "",
  districtCode: "",
  schoolId: 0,
};

const EditStudent = () => {
  const [data, setData] = useState<Student>(initialData);
  const [isAvailable, setIsAvailable] = useState<boolean>();
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>();
  const [lastNumber, setLastNumber] = useState<string>();

  const params = useParams();
  const router = useRouter();

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      studentName: "",
      fatherName: "",
      level: "",
      class: "", // Changed from `class` to `studentClass`
    },
  });
  const isLoading = form.formState.isSubmitting;
  const {
    handleSubmit,
    setValue,
    control,
    formState: { isSubmitting },
  } = form;
  const incrementRollNumber = (
    rollNumber: string,
    existingRollNumber: string,
    newClass: string
  ) => {
    if (!rollNumber) {
      // If roll number is undefined, generate a new roll number based on the pattern of the existing roll number
      const parts = existingRollNumber.split("-");
      // Update the class part of the roll number with the new class
      parts[parts.length - 3] = newClass;
      // Set the roll number to start with "001"
      parts[parts.length - 2] = "001";
      // Join the parts back together to form the new roll number
      return parts.join("-");
    }
    // Split the roll number into its parts
    const parts = rollNumber.split("-");

    // Extract the part to be incremented (assuming it's always the second-to-last part)
    let toIncrement = parseInt(parts[parts.length - 2]);

    // Increment the value
    toIncrement++;

    // Pad the incremented value with leading zeros
    const incremented = toIncrement.toString().padStart(3, "0");

    // Replace the original part with the incremented value
    parts[parts.length - 2] = incremented;

    // Join the parts back together to form the new roll number
    return parts.join("-");
  };

  useEffect(() => {
    const fetchData = async () => {
      const session = await getSession();

      setCurrentUserEmail(session?.user?.email);
    };
    fetchData();
  }, []);
  useEffect(() => {
    const fetchData = async () => {
      console.log(params.id);
      const response = await axios.get(
        `/api/users/registrations/${params.id}/${params.studentId}`
      );
      console.log("response.data");
      console.log(response.data);
      const registrartionData = await axios.get(
        `/api/users/registrations/${params.id}`
      );
      console.log(registrartionData);
      const contestData = await axios.get(
        `/api/users/contests/${registrartionData.data[0].contestId}`
      );
      console.log(contestData.data.endDate);
      const endDate = new Date(contestData.data.endDate);
      const currentDate = new Date();
      const isContestEnded = currentDate > endDate;
      console.log(isContestEnded);
      setIsAvailable(isContestEnded);

      form.reset({
        studentName: response.data.studentName,
        fatherName: response.data.fatherName,
        level: response.data.level,
        class: response.data.class, // Changed from `class` to `studentClass`
      });
      handleClassChange(response.data.class);
      setData(response.data);
    };
    fetchData();
  }, [form]);
  const onSubmit = async (values: zod.infer<typeof formSchema>) => {
    const payload = {
      ...values,
      currentUserEmail,
      rollNumber: data.rollNumber,
    };
    try {
      if (values.class !== data.class) {
        console.log("values.class");
        console.log(values.class);
        const lastStudent = await axios.get(
          `/api/users/registrations/${params.id}/lastRollnumber/${values.class}`
        );
        console.log("lastStudent");
        console.log(lastStudent);
        console.log(payload.rollNumber);
        const newRollNumber = incrementRollNumber(
          lastStudent.data.data,
          payload.rollNumber,
          values.class
        );
        payload.rollNumber = newRollNumber; // Set the roll number here inside the asynchronous block

        console.log("payloadd");
        console.log(newRollNumber);
        console.log(payload.rollNumber);
      }
      const response = await axios.put(
        `/api/users/registrations/${params.id}/${params.studentId}`,
        payload
      );
      router.back();
      toast.success("🦄 Student Updated successfully", {
        position: "bottom-center",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });
    } catch (error: any) {
      toast.error(" " + error.response.data.message, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });
      console.error("Error creating registration:", error);
      // Handle errors appropriately
    }
  };

  const handleClassChange = (classValue: string) => {
    let levelValue = "";
    switch (classValue) {
      case "01":
      case "02":
        levelValue = "preecolier";
        break;
      case "03":
      case "04":
        levelValue = "ecolier";
        break;
      case "05":
      case "06":
        levelValue = "benjamin";
        break;
      case "07":
      case "08":
        levelValue = "cadet";
        break;
      case "09":
      case "10":
        levelValue = "junior";
        break;
      case "11":
      case "12":
        levelValue = "student";
        break;
      default:
        levelValue = ""; // or any default value
        break;
    }

    setValue("level", levelValue);
  };

  return (
    <section className="bg-white mb-12">
      <div className=" pt-10  grid grid-cols-1">
        <div className="rounded-lg shadow-2xl md:mt-0 sm:max-w-md xl:p-0 mx-auto">
          <div className="p-6 space-y-3 md:space-y-6 sm:p-8">
            <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl ">
              Update Student
            </h1>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4 md:space-y-6">
                <FormField
                  control={form.control}
                  name="studentName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="label">Student Name</FormLabel>
                      <FormControl>
                        <Input
                          disabled={isLoading}
                          className="input"
                          placeholder="Enter Student Name"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="fatherName"
                  render={({ field }) => (
                    <FormItem className="">
                      <FormLabel className="label mt-5">Father Name</FormLabel>
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
                <Controller
                  name="class"
                  control={form.control}
                  render={({ field }) => (
                    <select
                      {...field}
                      onChange={(e) => {
                        // Update the form state for the class
                        field.onChange(e.target.value);
                        // Automatically set the level based on the class
                        handleClassChange(e.target.value);
                      }}
                      className="w-full p-2 text-xs md:text-base rounded border border-gray-300 focus:outline-none focus:border-blue-500">
                      <option value="">SELECT CLASS</option>
                      <option value="01">ONE</option>
                      <option value="02">TWO</option>
                      <option value="03">THREE</option>
                      <option value="04">FOUR</option>
                      <option value="05">FIVE</option>
                      <option value="06">SIX</option>
                      <option value="07">SEVEN</option>
                      <option value="08">EIGHT/O LEVEL-I</option>
                      <option value="09">NINE/O LEVEL-I & II</option>
                      <option value="10">TEN/O LEVEL-II & III</option>
                      <option value="11">ELEVEN/O LEVEL-III & A LEVEL-I</option>
                      <option value="12">TWELVE/A LEVEL-I & II</option>
                    </select>
                  )}
                />
                <Controller
                  name="level"
                  control={form.control}
                  render={({ field }) => (
                    <select
                      disabled
                      {...field}
                      className="w-full p-2 text-xs md:text-base rounded border border-gray-300 focus:outline-none focus:border-blue-500">
                      <option value="">SELECT LEVEL</option>
                      <option value="preecolier">PRE ECOLIER</option>
                      <option value="ecolier">ECOLIER</option>
                      <option value="benjamin">BENJAMIN</option>
                      <option value="cadet">CADET</option>
                      <option value="junior">JUNIOR</option>
                      <option value="student">STUDENT</option>
                    </select>
                  )}
                />

                <div className="flex items-center justify-center mt-16">
                  <Button
                    disabled={isLoading}
                    variant="default"
                    className="px-10">
                    Update Student Details
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default EditStudent;
