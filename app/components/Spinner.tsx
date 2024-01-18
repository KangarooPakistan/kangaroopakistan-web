import { Oval } from "react-loader-spinner";

const Spinner = () => {
  return (
<div className="flex justify-center items-center h-screen">
      <Oval
        height={100}
        width={100}
        color="#4fa94d"
        ariaLabel="oval-loading"
        wrapperStyle={{}}
        wrapperClass=""
      />
    </div>
  );
};

export default Spinner;
