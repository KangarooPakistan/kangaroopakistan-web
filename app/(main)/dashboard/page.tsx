
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
const Dashboard = async () => {
  const session = await getServerSession(authOptions);
  const mysession = JSON.stringify(session);

  return (
    <div>
      Hi
      <pre>{mysession}</pre>
      
    </div>
  );
};

export default Dashboard;
