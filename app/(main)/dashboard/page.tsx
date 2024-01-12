import { getServerSession } from "next-auth";
import { authOptions } from "../../lib/authOptions";
import Frontend from "./frontend";
const Dashboard = async () => {
  const session = await getServerSession(authOptions);
  const mysession = JSON.stringify(session);

  return (
    <div>
      Hi
      <pre>{mysession}</pre>
      <Frontend />
      {/* <ProfileButton /> */}
    </div>
  );
};

export default Dashboard;
