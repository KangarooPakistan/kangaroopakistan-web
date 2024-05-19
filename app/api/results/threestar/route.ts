import { NextResponse, NextRequest } from "next/server";
import mysql from "mysql2/promise";

// Create a MySQL connection pool
const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "Pakistan@123",
  database: "kangroo_db",
  connectionLimit: 10, // Set your desired connection limit
});

export async function GET(request: NextRequest) {
  try {
    // Get a connection from the pool
    console.log("--------------------------------");
    const connection = await pool.getConnection();

    // Execute the query
    const [rows] = await connection.execute(`
    SELECT c.id contestId ,c.name contest, ss.rollNumber, ss.studentName, ss.fatherName, ss.class , r.schoolName ,s.districtName, scc.SCORE, scc.PERCENTAGE
    FROM student ss
    INNER JOIN u_scores scc ON scc.ROLL_NO = ss.rollNumber
    INNER JOIN registration r ON r.id = ss.registrationId
    Inner join user s on s.schoolId = r.schoolId
    INNER JOIN contest c ON c.id = scc.CONTEST_ID
    WHERE scc.PERCENTAGE BETWEEN 63 AND 68.9
    and scc.CONTEST_ID = 'd0922e13-5b8f-4d78-a8be-ec885da9f383'
    order by ss.class,scc.percentage desc, r.schoolName, ss.studentName
  
    `);

    // Release the connection back to the pool
    connection.release();

    // Return the fetched data as a JSON response
    return NextResponse.json(rows);
  } catch (error: any) {
    console.log("---------------------------");
    // Handle errors and return an appropriate response
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
