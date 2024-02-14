"use client";
import axios from "axios";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { Registration, columns } from "./columns";
import { DataTable } from "./data-table";



// Define a type for Registration, including the students array
type Register = {
  // Add registration properties here
  id: string;
  students: Student[];
  // Add other registration fields as necessary
};
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
type LevelCounts = Record<string, number>;

const FetchAllRegistrations = () => {
  const params = useParams();
  const [data, setData] = useState<Registration[]>([]);
  const [allStudents, setAllStudents] =useState<Student[]>([]);

  // States for each level of students
  const [preEculier, setPreEculier] = useState<number>(0);
  const [eculier, setEculier] = useState<number>(0);
  const [benjamin, setBenjamin] = useState<number>(0);
  const [cadet, setCadet] = useState<number>(0);
  const [junior, setJunior] = useState<number>(0);
  const [student, setStudent] = useState<number>(0);
  const totalStudents = 146; // Example total
  const levels = {
    preEculier: 29,
    eculier: 38,
    benjamin: 23,
    cadet: 33,
    junior: 23,
    student: 33,
  };

  useEffect(() => {
    const fetchData = async () => {
      console.log(params.id);

      console.log(`/api/users/fetchallregistrations/${params.id}`);
      const res = await axios.get(
        `/api/users/fetchallregistrations/${params.id}`
      );
      const registrations = res.data;
      const studentsArrays = registrations.map((reg: Register) => reg.students);
      const flattenedStudents = studentsArrays.flat();

      // Flatten the array of students arrays into a single array of students
      setAllStudents(flattenedStudents);
      console.log('-----')
      console.log(flattenedStudents)
      // Count students at each level
      const levelCounts = flattenedStudents.reduce((acc: LevelCounts, student: Student) => {
        const { level } = student;
        acc[level] = (acc[level] || 0) + 1;
        return acc;
      }, {});

      // Set state for each level
      setPreEculier(levelCounts["preecolier"] || 0);
      setEculier(levelCounts["ecolier"] || 0);
      setBenjamin(levelCounts["benjamin"] || 0);
      setCadet(levelCounts["cadet"] || 0);
      setJunior(levelCounts["junior"] || 0);
      setStudent(levelCounts["student"] || 0);

      setData(res.data);
      const extractedData = res.data.map((obj: any) => ({
        contestId: obj.contestId,
        schoolName: obj.schoolName,
        schoolId: obj.schoolId,
        id: obj.id,
        registeredBy: obj.registeredBy,
        studentsLength: obj.students.length,
        email: obj.user.email,
      }));
      setData(extractedData);
      console.log(res);
      console.table(res);
    };
    fetchData();
  }, []);
  return (
    <>
      <div className="container mx-auto py-10">
        <div className="flex flex-wrap -mx-2">
          <div className="w-full md:w-1/2 px-2 mb-6 md:mb-0">
            <div className="bg-gradient-to-r from-blue-500 to-teal-500 rounded-lg shadow-lg p-6 text-white transform transition duration-500 hover:scale-105">
              <h2 className="font-bold text-2xl mb-4">Total # of Students</h2>
              {/* Assuming you want to dynamically calculate and display the total number of students */}
              <p className="text-lg font-semibold">{allStudents.length}</p>
            </div>
          </div>
          <div className="w-full md:w-1/2 px-2">
            <div className="bg-gradient-to-r from-blue-500 to-teal-500 rounded-lg shadow-lg p-6 text-white transform transition duration-500 hover:scale-105">
              <h2 className="font-bold text-2xl mb-4">Levels</h2>
              <ul>
                <li className="mb-2 text-lg font-medium">Total # of PreEculier: <span className="font-bold">{preEculier}</span></li>
                <li className="mb-2 text-lg font-medium">Total # of Eculier: <span className="font-bold">{eculier}</span></li>
                <li className="mb-2 text-lg font-medium">Total # of Benjamin: <span className="font-bold">{benjamin}</span></li>
                <li className="mb-2 text-lg font-medium">Total # of Cadet: <span className="font-bold">{cadet}</span></li>
                <li className="mb-2 text-lg font-medium">Total # of Junior: <span className="font-bold">{junior}</span></li>
                <li className="mb-2 text-lg font-medium">Total # of Student: <span className="font-bold">{student}</span></li>
              </ul>
            </div>
          </div>
        </div>
        <DataTable columns={columns} data={data} />;
      </div>
    </>
  );
};

export default FetchAllRegistrations;
