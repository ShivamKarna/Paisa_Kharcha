import { Suspense } from "react";
import DashboardPage from "./page";
import { BarLoader } from "react-spinners";
const DashboardLayout = () => {
  return (
    <div className="px-5">
      <h1 className="text-6xl font-bold gradient-title">Dashboard</h1>

      {/* to show the loader, we use the BarLoader component  */}
      {/* the suspense is a wraapper which will help us to call a api */}
      <Suspense
        fallback={<BarLoader className="mt-4" width={"100%"} color="#4be82d" />}
      >
        {/* IMported the component */}
        <DashboardPage />
      </Suspense>
    </div>
  );
};
export default DashboardLayout;
