import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import Frontend from "./frontend";
const Dashboard = async () => {
  const session = await getServerSession(authOptions);
  const mysession = JSON.stringify(session);

  return (
    <div>
      Hi
      <pre>{mysession}</pre>
      <Frontend />
    </div>
  );
};

export default Dashboard;
