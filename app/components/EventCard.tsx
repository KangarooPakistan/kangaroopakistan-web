import React from "react";
import { Event, Student } from "../../lib/types";

const formatDate = (dateInput: Date | string | number): string => {
  let date: Date;

  if (dateInput instanceof Date) {
    date = dateInput;
  } else if (typeof dateInput === "string" || typeof dateInput === "number") {
    date = new Date(dateInput);
  } else {
    return "Invalid Date";
  }

  if (isNaN(date.getTime())) {
    return "Invalid Date";
  }

  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  };

  try {
    return date.toLocaleDateString("en-US", options);
  } catch (error) {
    console.error("Error formatting date:", error);
    return "Date formatting error";
  }
};

interface EventCardProps {
  event: Event;
}

const EventCard: React.FC<EventCardProps> = ({ event }) => {
  let studentObject;

  try {
    studentObject =
      typeof event.studentPrev === "string"
        ? JSON.parse(event.studentPrev)
        : event.studentPrev;
  } catch (error) {
    console.error("Error parsing studentPrev:", error);
    studentObject = null;
  }

  return (
    <div className="mb-6 p-6 relative max-w-xl">
      <div className="card bg-gradient-to-br from-gray-700 to-gray-900 rounded-xl shadow-lg p-6 text-white overflow-hidden relative">
        <div className="card-shine"></div>
        <div className="card-content relative z-10">
          <div className="absolute top-4 right-4 w-16 h-16 bg-white bg-opacity-20 rounded-full"></div>
          <div className="absolute bottom-4 left-4 w-24 h-12 bg-white bg-opacity-10 rounded-lg"></div>

          <h2 className="bg-white text-blue-600 p-3 xs:text-lg md:text-xl xl:text-2xl 2xl:text-3xl font-bold mb-4">
            {event.type}: {event.contestName}
          </h2>

          <p className="mb-4 xs:text-sm md:text-md xl:text-xl font-medium break-words ">
            {event.description}
          </p>

          <div className="flex flex-col justify-between  mb-4">
            <span className="xs:text-sm md:text-md xl:text-xl">
              Date: {formatDate(event.createdAt)}
            </span>
            <span className="xs:text-sm md:text-md xl:text-xl break-words">
              User : {event.email}
            </span>
          </div>

          {event.schoolName && (
            <p className="mb-4 xs:text-sm md:text-md xl:text-xl break-words">
              School: {event.schoolName}
            </p>
          )}
          {event.schoolId && (
            <p className="mb-4 xs:text-sm md:text-md xl:text-xl break-words">
              School: {event.schoolId}
            </p>
          )}

          {event.students && event.students.length > 0 && (
            <div className="mt-4">
              <h3 className="font-semibold mb-2 xs:text-sm md:text-md xl:text-xl">
                Added Students:
              </h3>
              <ul className="list-disc pl-5 ">
                {event.students.map((student) => (
                  <li
                    key={student.id}
                    className="mb-1 xs:text-sm md:text-md xl:text-xl break-words ">
                    <div className="flex flex-col flex-wrap">
                      <p className="xs:text-sm md:text-md xl:text-xl">
                        <span className="mr-2 break-words">Name:</span>
                        {student.studentName}{" "}
                      </p>
                      <p className="xs:text-sm md:text-md xl:text-xl">
                        <span className="mr-2">RollNumber:</span>
                        {student.rollNumber}
                      </p>
                      <p className="xs:text-sm md:text-md xl:text-xl">
                        <span className="mr-2"> Class:</span>
                        {student.class}
                      </p>{" "}
                      <p className="xs:text-sm md:text-md xl:text-xl">
                        {" "}
                        <span className="mr-2"> Level: </span>
                        {student.level}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {studentObject !== null && (
            <div className="mt-4">
              <h3 className="font-semibold mb-2 xs:text-sm md:text-md xl:text-xl break-words">
                Previous Information of Student:
              </h3>
              <ul className="list-disc pl-5 text-xs">
                <li key={event.studentPrev} className="mb-1 ">
                  <div className="flex flex-col">
                    <p className="xs:text-sm md:text-md xl:text-xl ">
                      <span className="mr-2 break-words">Name:</span>
                      {studentObject.studentName}
                    </p>
                    <p className="xs:text-sm md:text-md xl:text-xl">
                      <span className="mr-2"> RollNumber:</span>
                      {studentObject.rollNumber}{" "}
                    </p>
                    <p className="xs:text-sm md:text-md xl:text-xl">
                      <span className="mr-2">Class:</span>
                      {studentObject.class}
                    </p>{" "}
                    <p className="xs:text-sm  md:text-md xl:text-xl">
                      {" "}
                      <span className="mr-2">Level:</span>
                      {studentObject.level}
                    </p>
                  </div>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
      <style jsx>{`
        .card {
          position: relative;
          transition: all 0.3s ease;
        }
        .card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
        }
        .card-shine {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(
            135deg,
            rgba(255, 255, 255, 0) 0%,
            rgba(255, 255, 255, 0.1) 15%,
            rgba(255, 255, 255, 0.1) 20%,
            rgba(255, 255, 255, 0) 30%
          );
          transform: translateX(-100%);
          animation: shine 3s infinite;
        }
        @keyframes shine {
          0% {
            transform: translateX(-100%);
          }
          20% {
            transform: translateX(100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        .card::after {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(
            135deg,
            rgba(255, 255, 255, 0.1) 0%,
            rgba(255, 255, 255, 0) 50%,
            rgba(255, 255, 255, 0.1) 100%
          );
          pointer-events: none;
        }
      `}</style>
    </div>
  );
};

export default EventCard;
