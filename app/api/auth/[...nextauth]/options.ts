export type TypeUser = {
    id: string | number;       // User's unique identifier
    email: string;             // User's email address
    role: String;    // 'admin', 'user', etc.
    schoolId:number;     // Optional: only for non-admin users
    schoolName:string;  // Optional: only for non-admin users
    contactNumber: string;    
  };
