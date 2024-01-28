import { getServerSession } from "next-auth";
import { authOptions } from "../../lib/authOptions";
import Frontend from "./frontend";
import InitialModal from "@/components/modals/initial-modal";
import { useModal } from "@/hooks/use-modal-store";
const Dashboard = async () => {
  const session = await getServerSession(authOptions);
  const mysession = JSON.stringify(session);

  return (
    <div>
      {/* Hi */}
      {/* <pre>{mysession}</pre> */}
      <Frontend />
      {/* <InitialModal /> */}
      {/* <ProfileButton /> */}
    </div>
  );
};

export default Dashboard;
