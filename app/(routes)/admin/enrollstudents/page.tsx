"use client";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface Student {
  name: string;
  fatherName: string;
}

const Page = () => {
  const [students, setStudents] = useState<Student[]>([
    { name: "", fatherName: "" },
    { name: "", fatherName: "" },
    { name: "", fatherName: "" },
    { name: "", fatherName: "" },
    { name: "", fatherName: "" },
    { name: "", fatherName: "" },
    { name: "", fatherName: "" },
    { name: "", fatherName: "" },
    { name: "", fatherName: "" },
    { name: "", fatherName: "" },
  ]);

  const addRow = () => {
    setStudents([...students, { name: "", fatherName: "" }]);
  };

  const removeRow = () => {
    const updatedStudents = students.slice(0, -1);
    console.log(updatedStudents);
    console.log(updatedStudents.length);
    setStudents(updatedStudents);
  };

  const updateStudent = (
    index: number,
    value: string,
    field: "name" | "fatherName"
  ) => {
    setStudents(
      students.map((student, i) =>
        i === index ? { ...student, [field]: value } : student
      )
    );
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("Number of students:", students.length);
    // Add any additional logic or API calls here for form submission
  };

  return (
    <div className="sm:container mx-5 sm:mx-0">
      <h1 className="text-lg text-center md:text-2xl font-bold mb-2 md:mb-10 mt-4 flex justify-center">
        Students Contest Enrollment Form
      </h1>

      <form onSubmit={handleSubmit} className="flex justify-center mb-10">
        <div className="sm:border sm:mx-auto pb-9 pt-6 sm:px-10 rounded-md">
          <h2 className="text-base md:text-xl font-semibold flex items-center justify-center mb-8">
            Students List
          </h2>

          <div className="grid grid-cols-2 gap-4 md:gap-20">
            <label
              htmlFor="studentName"
              className="block text-base md:text-xl text-gray-700 font-bold mb-2"
            >
              Student Name
            </label>
            <label
              htmlFor="fatherName"
              className="block text-base md:text-xl text-gray-700 font-bold mb-2"
            >
              Father Name
            </label>
          </div>

          {students.map((student, index) => (
            <div key={index} className="grid grid-cols-2 gap-4 md:gap-20 mb-4">
              <input
                type="text"
                id={`studentName${index}`}
                value={student.name}
                onChange={(e) => updateStudent(index, e.target.value, "name")}
                className="p-1 sm:p-2 border rounded-md text-xs md:text-base"
                required
              />
              <input
                type="text"
                id={`fatherName${index}`}
                value={student.fatherName}
                onChange={(e) =>
                  updateStudent(index, e.target.value, "fatherName")
                }
                className="p-1 sm:p-2 border rounded-md text-xs md:text-base"
                required
              />
            </div>
          ))}

          <div className="flex items-center justify-center">
            <Button
              type="button"
              className="px-4 py-2 rounded-md mr-3 text-sm md:text-base"
              onClick={addRow}
            >
              Add Student
            </Button>
            <Button
              type="button"
              className="px-4 py-2 rounded-md text-sm md:text-base"
              onClick={removeRow}
            >
              Remove Student
            </Button>
          </div>

          <div className="flex justify-center">
            <button
              type="submit"
              className="bg-green-500 text-white px-4 py-2 rounded-md mt-4 text-sm md:text-base"
            >
              Submit
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Page;
