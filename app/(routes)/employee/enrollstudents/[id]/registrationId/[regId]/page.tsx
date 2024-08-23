"use client";
import React, { ChangeEvent, useEffect, useState } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as zod from "zod";
import { getSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import * as XLSX from "xlsx";
import { Button } from "@/components/ui/button";

interface StudentData {
  studentName: string;
  fatherName: string;

  level: string;
  class: string;
}
interface StudentImport {
  studentName?: string;
  fatherName?: string;
  class?: string;
}

interface FormData {
  students: StudentData[];
}

const schema = zod.object({
  students: zod.array(
    zod.object({
      studentName: zod.string().min(1, "Student name is required"),
      fatherName: zod.string().min(1, "Father's name is required"),
      // rollNumber: zod
      //   .string()
      //   .regex(rollNumberRegex, "Roll number must be in the correct format"),
      level: zod.string().min(1, "Pls select level"),
      class: zod
        .string()
        .min(1, "Pls select class, it is necessory for roll number"),
    })
  ),
});

const Register = () => {
  const [duplicateError, setDuplicateError] = useState<string | null>(null);
  const { id, regId } = useParams<{ id: string; regId: string }>();

  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false); // State to track if the form is submitting

  const [contestCh, setContestCh] = useState<string | null>();
  const [schoolId, setSchoolId] = useState<number | undefined>();
  const [schoolEmail, setSchoolEmail] = useState<number | undefined | null>();
  const [district, setDistrict] = useState<string | undefined | null>();
  const [registerationId, setRegistrationId] = useState<
    string | undefined | null
  >();

  const [year, setYear] = useState<string | undefined>();
  const [schoolName, setSchoolName] = useState<string | undefined>();

  useEffect(() => {
    const getYearInTwoDigits = (date: Date): string => {
      return new Intl.DateTimeFormat("en-US", {
        year: "2-digit",
      }).format(date);
    };

    const fetch = async () => {
      const resp = await axios.get(`/api/users/contests/${id}`);
      console.log("resp");
      console.log(resp);
      const dataByRegId = await axios.get(`/api/users/registrations/${regId}`);
      console.log(dataByRegId);
      setContestCh(resp.data.contestCh);
      const endDate = new Date(resp.data.endDate);
      console.log(endDate);
      const contestYear = getYearInTwoDigits(endDate);
      setYear(contestYear);
      console.log("-KKR-");
      setRegistrationId(regId);
      setDistrict(dataByRegId.data[0].user.district);
      setSchoolName(dataByRegId.data[0].user.schoolName);
      setSchoolId(dataByRegId.data[0].user.schoolId);
      setSchoolEmail(dataByRegId.data[0].user.id);
    };
    fetch();
  }, [id]);

  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      students: [
        {
          studentName: "",
          fatherName: "",
          // rollNumber: "",
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

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);

    const hasDuplicates = data.students.some((student, index) =>
      isDuplicate(data, index)
    );

    if (hasDuplicates) {
      setDuplicateError("Name and Father's name must be unique");
    } else {
      // Proceed with form submission
      const studentsArray = data.students;
      const payload = {
        students: studentsArray,
        year: year,
        district: district,
        registrationId: registerationId,
        contestCh: contestCh,
        schoolName: schoolName,
        schoolId: schoolId,
        registeredBy: schoolEmail,
      };
      try {
        const response = await axios.post(
          `/api/users/contests/${id}/registrations`,
          payload
        );

        router.back();
        toast.success(
          "🦄 Student registered successfully, Please check your email",
          {
            position: "bottom-center",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "light",
          }
        );
        setIsSubmitting(false);

        // Handle successful registration creation
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
        setIsSubmitting(false);

        // Handle errors appropriately
      }

      setDuplicateError(null); // Clear any previous error
    }
  };
  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];

      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        const binaryStr = e.target?.result;
        if (binaryStr) {
          // Proceed only if the result is not null
          const workbook = XLSX.read(binaryStr, { type: "binary" });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const json = XLSX.utils.sheet_to_json(worksheet);
          console.log(json); // Check the output in the browser console

          populateFormFields(json as StudentImport[]);
        } else {
          // Handle the error case where e.target.result is null
          console.error("Failed to read the file");
          // Optionally, notify the user that the file could not be read
        }
      };
      reader.onerror = (error) => {
        // Handle file reading errors
        console.error("Error reading the file:", error);
        // Optionally, notify the user that an error occurred while reading the file
      };
      reader.readAsBinaryString(file);
    } else {
      // Handle the case where no file was selected
      console.error("No file selected");
      // Optionally, notify the user that no file was selected
    }
  };

  const populateFormFields = (data: StudentImport[]) => {
    console.log(data);
    const stds = data.map((item) => ({
      studentName: item.studentName || "",
      fatherName: item.fatherName || "",
      class: item.class || "",
      level: "", // You can dynamically set this based on class if needed
    }));
    console.log(stds); // Add this line before setValue("students", students);

    setValue("students", stds);
    stds.forEach((student, index) => {
      handleClassChange(student.class, index);
      console.log("kkr");
    });
  };
  const { fields, append, remove } = useFieldArray({
    control,
    name: "students",
  });

  const handleClassChange = (classValue: string, index: number) => {
    console.log(classValue);
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
      // Add more cases if needed
      default:
        break;
    }
    console.log(levelValue);
    console.log(`students.${index}.level`);
    setValue(`students.${index}.level`, levelValue);
  };
  const handleBack = () => {
    router.back();
  };
  return (
    <div className="container mx-auto py-4">
      <p className="text-xl flex flex-col items-center justify-center text-purple-600 font-bold mb-3 mt-3">
        For Bulk Upload Please Download the Sample file, Fill it with
        StudentName, FatherName and Class and then upload it again. <br />
        <span className=" text-red-600 font-bold">
          Please Do not edit or remove the headings of the columns in the sample
          excel file
        </span>
      </p>
      <div className="flex justify-center w-full mt-4 mb-4">
        <div className="flex mr-8">
          <label
            htmlFor="file-input"
            className="flex items-center px-4 py-2 border border-dashed mr-4 bg-purple-500 text-white border-gray-400 rounded-md cursor-pointer hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800">
            <span className="text-sm font-medium truncate mr-2">
              Upload Excel File
            </span>
            <input
              type="file"
              id="file-input"
              accept=".xlsx, .xls"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>

          <a
            href="https://docs.google.com/spreadsheets/d/1SzmgA9fbOd9lA72jJCRrJcTw7UbN8wpr/export?format=xlsx"
            download="sample.xlsx"
            className="flex items-center px-4 py-2 border border-dashed bg-purple-500 text-white border-gray-400 rounded-md cursor-pointer hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800">
            <span className="text-sm font-medium truncate">
              Download Sample File
            </span>
          </a>
        </div>
      </div>
      <div className="flex justify-start w-full mt-4 mb-4">
        <Button variant="default" onClick={handleBack}>
          Back
        </Button>
      </div>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="mx-auto p-4 border border-gray-300 rounded-lg">
        {duplicateError && <p className="text-red-500">{duplicateError}</p>}
        {fields.map((field, index) => (
          <div
            key={field.id}
            className="mb-4 p-2 border-solid border-2 border-grey-600 ">
            <div className="grid items-center lg:space-x-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
              <div className="md:mr-4 lg:mr-0">
                <input
                  {...register(`students.${index}.studentName`)}
                  placeholder="Student Name"
                  className="w-full p-2 text-sm md:text-base rounded border border-gray-300 focus:outline-none focus:border-blue-500"
                />
                {errors?.students?.[index]?.studentName && (
                  <p className="text-red-500">
                    {errors.students[index]?.studentName?.message}
                  </p>
                )}
              </div>
              <div className="mt-3 md:mt-0">
                <input
                  {...register(`students.${index}.fatherName`)}
                  placeholder="Father's Name"
                  className="w-full p-2 rounded border text-sm md:text-base border-gray-300 focus:outline-none focus:border-blue-500"
                />
                {errors?.students?.[index]?.fatherName && (
                  <p className="text-red-500">
                    {errors.students[index]?.fatherName?.message}
                  </p>
                )}
              </div>
              <div className="mt-3 lg:mt-0 md:mr-4 lg:mr-0">
                <Controller
                  name={`students.${index}.class`}
                  control={control}
                  render={({ field }) => (
                    <select
                      {...field}
                      onChange={(e) => {
                        field.onChange(e); // Important: update the form state
                        handleClassChange(e.target.value, index); // Update the level based on the class
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
                {errors?.students?.[index]?.class && (
                  <p className="text-red-500">
                    {errors.students[index]?.class?.message}
                  </p>
                )}
              </div>
              <div className="mt-3 lg:mt-0">
                <Controller
                  name={`students.${index}.level`}
                  control={control}
                  render={({ field }) => (
                    <select
                      disabled
                      {...field}
                      className="w-full p-2 rounded border text-xs md:text-base border-gray-300 focus:outline-none focus:border-blue-500">
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
                {errors?.students?.[index]?.level && (
                  <p className="text-red-500">
                    {errors.students[index]?.level?.message}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
        <div className="block sm:flex sm:justify-center space-x-2 sm:space-x-4 mt-4 mx-auto">
          <div className="flex justify-center sm:block gap-5 sm:space-x-4">
            <button
              type="button"
              onClick={() =>
                append({
                  studentName: "",
                  fatherName: "",
                  level: "",
                  class: "",
                })
              }
              className="bg-blue-500 hover:bg-blue-600 text-white p-3 text-xs sm:text-base sm:px-4 sm:py-2 rounded">
              Add Another Student
            </button>
            <button
              type="button"
              onClick={() => remove(fields.length - 1)}
              className="bg-red-500 hover:bg-red-600 text-white p-3 text-xs sm:text-base sm:px-4 sm:py-2 rounded">
              Remove Student
            </button>
          </div>
          <div className="flex justify-center sm:block mt-4 sm:mt-0">
            <button
              type="submit"
              disabled={isSubmitting} // Disable the button if isSubmitting is true
              className=" bg-green-500 hover:bg-green-600 text-white p-3 text-xs sm:text-base sm:px-4 sm:py-2 rounded">
              {isSubmitting ? "Submitting..." : "Submit Form"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Register;
