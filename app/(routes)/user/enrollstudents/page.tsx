"use client";
import React, { useState } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as zod from "zod";

interface StudentData {
  studentName: string;
  fatherName: string;
  rollNumber: string;
  level: string;
  class: string;
}

interface FormData {
  students: StudentData[];
}
const schema = zod.object({
  students: zod.array(
    zod.object({
      studentName: zod.string().min(1, "Student name is required"),
      fatherName: zod.string().min(1, "Father's name is required"),
      rollNumber: zod.string().min(1, "Roll number is required"),
      level: zod.string(),
      class: zod.string(),
    })
  ),
});

const Register = () => {
  const [duplicateError, setDuplicateError] = useState<string | null>(null);

  const {
    register,
    control,
    handleSubmit,
    setValue,
    setError,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      students: [
        {
          studentName: "",
          fatherName: "",
          rollNumber: "",
          level: "",
          class: "",
        },
      ],
    },
  });

  const isDuplicate = (formData: FormData, index: number) => {
    const currentName = formData.students[index].studentName;
    const currentFatherName = formData.students[index].fatherName;

    for (let i = 0; i < index; i++) {
      const prevName = formData.students[i].studentName;
      const prevFatherName = formData.students[i].fatherName;

      if (currentName === prevName && currentFatherName === prevFatherName) {
        return true;
      }
    }

    return false;
  };
  const onSubmit = (data: FormData) => {
    const hasDuplicates = data.students.some((student, index) =>
      isDuplicate(data, index)
    );

    if (hasDuplicates) {
      // Set error message for duplicate fields.
      setDuplicateError("Name and Father's name must be unique");

      // data.students.forEach((student, index) => {
      //   if (isDuplicate(data, index)) {
      //     setError(
      //       `students[${index}].studentName` as `students.${number}.studentName`,
      //       {
      //         type: "manual",
      //         message: "Name and Father's name must be unique",
      //       }
      //     );

      //     setError(
      //       `students[${index}].fatherName` as `students.${number}.fatherName`,
      //       {
      //         type: "manual",
      //         message: "Name and Father's name must be unique",
      //       }
      //     );
      //   }
      // });
    } else {
      // Proceed with form submission
      console.log(data);
      setDuplicateError(null); // Clear any previous error
    }
  };
  const { fields, append, remove } = useFieldArray({
    control,
    name: "students",
  });

  const generateRollNumber = (index: number) => {
    // Dummy logic for roll number generation
    const rollNumber = `RN-${Math.floor(Math.random() * 10000)}`;
    console.log(rollNumber);

    // Update the rollNumber value for a specific student
    const updatedStudents = [...fields];
    updatedStudents[index].rollNumber = rollNumber;

    // Set the updated students array to trigger re-render
    // setValue("students", updatedStudents);
    fields[index].rollNumber = rollNumber;
    setValue(
      `students[${index}].rollNumber` as `students.${number}.rollNumber`,
      rollNumber
    );
  };

  // const onSubmit = (data: FormData) => {
  //   console.log(data);
  // };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className=" mx-auto p-4 border border-gray-300 rounded-lg"
    >
      {duplicateError && <p className="text-red-500">{duplicateError}</p>}
      {fields.map((field, index) => (
        <div key={field.id} className="mb-4 p-2 border-b mx-auto border-gray-300">
          <div className="flex items-center space-x-4">
            <div className="w-1/4">
              <input
                {...register(`students.${index}.studentName`)}
                placeholder="Student Name"
                className="w-full p-2 rounded border border-gray-300 focus:outline-none focus:border-blue-500"
              />
              {errors?.students?.[index]?.studentName && (
                <p className="text-red-500">
                  {errors.students[index]?.studentName?.message}
                </p>
              )}
            </div>
            <div className="w-1/4">
              <input
                {...register(`students.${index}.fatherName`)}
                placeholder="Father's Name"
                className="w-full p-2 rounded border border-gray-300 focus:outline-none focus:border-blue-500"
              />
              {errors?.students?.[index]?.fatherName && (
                <p className="text-red-500">
                  {errors.students[index]?.studentName?.message}
                </p>
              )}
            </div>
            <div className="w-1/4 relative">
              <input
                {...register(`students.${index}.rollNumber`)}
                placeholder="Roll Number"
                readOnly // Make it readonly to prevent manual input
                className="w-full p-2 rounded border border-gray-300 focus:outline-none focus:border-blue-500"
              />

              <button
                type="button"
                onClick={() => generateRollNumber(index)}
                className="absolute right-0 top-0 h-full bg-blue-500 text-white px-3 py-2 rounded-r"
              >
                Generate
              </button>
              {errors?.students?.[index]?.rollNumber && (
                <p className="text-red-500">
                  {errors.students[index]?.studentName?.message}
                </p>
              )}
            </div>
            <div className="w-1/4">
              <Controller
                name={`students.${index}.level`}
                control={control}
                render={({ field }) => (
                  <select
                    {...field}
                    className="w-full p-2 rounded border border-gray-300 focus:outline-none focus:border-blue-500"
                  >
                    <option value="">Select level</option>
                    <option value="one">One</option>
                    <option value="two">Two</option>
                    <option value="three">Three</option>
                    <option value="four">Four</option>
                    <option value="five">Five</option>
                    <option value="six">Six</option>
                    <option value="seven">Four</option>
                    {/* Add level options here */}
                  </select>
                )}
              />
              {errors?.students?.[index]?.studentName && (
                <p className="text-red-500">
                  {errors.students[index]?.studentName?.message}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-4 mt-2">
            <div className="w-1/4">
              <Controller
                name={`students.${index}.class`}
                control={control}
                render={({ field }) => (
                  <select
                    {...field}
                    className="w-full p-2 rounded border border-gray-300 focus:outline-none focus:border-blue-500"
                  >
                    <option value="one">One</option>
                    <option value="two">Two</option>
                    <option value="three">Three</option>
                    <option value="four">Four</option>
                    <option value="five">Five</option>
                    <option value="six">Six</option>
                  </select>
                )}
              />
              {errors?.students?.[index]?.studentName && (
                <p className="text-red-500">
                  {errors.students[index]?.studentName?.message}
                </p>
              )}
            </div>
          </div>
        </div>
      ))}
      <div className="flex justify-center space-x-4 mt-4">
        <button
          type="button"
          onClick={() =>
            append({
              studentName: "",
              fatherName: "",
              rollNumber: "",
              level: "",
              class: "",
            })
          }
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
        >
          Add Row
        </button>
        <button
          type="button"
          onClick={() => remove(fields.length - 1)}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
        >
          Remove Row
        </button>
        <button
          type="submit"
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
        >
          Submit Form
        </button>
      </div>
    </form>
  );
};

export default Register;
