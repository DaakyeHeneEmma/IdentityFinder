import { useEffect, useState } from "react";
import { useAuth } from "@/app/auth/AuthContext";
import { ReportCardSubmission } from "@/types/reportCard";
import { LoaderSmall } from "../common/Loader";

const ReportCardTable = () => {
  const { user, getIdToken } = useAuth();
  const [reportCards, setReportCards] = useState<ReportCardSubmission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReportCards = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const idToken = await getIdToken();
        if (!idToken) {
          console.error("No authentication token available");
          setLoading(false);
          return;
        }

        const response = await fetch("/api/report-cards", {
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        });
        const result = await response.json();

        if (result.success) {
          setReportCards(result.data);
        }
      } catch (error) {
        console.error("Error fetching report cards:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReportCards();
  }, [user, getIdToken]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "lost":
        return "text-red-600 bg-red-100";
      case "found":
        return "text-green-600 bg-green-100";
      case "resolved":
        return "text-blue-600 bg-blue-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  if (!user) {
    return (
      <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="px-4 py-6 md:px-6 xl:px-7.5">
          <h4 className="text-xl font-semibold text-black dark:text-white">
            Your Report Cards
          </h4>
        </div>
        <div className="p-6 text-center">
          <p className="text-gray-500">
            Please sign in to view your report cards
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
      <div className="px-4 py-6 md:px-6 xl:px-7.5">
        <h4 className="text-xl font-semibold text-black dark:text-white">
          Your Report Cards
        </h4>
      </div>

      <div className="grid grid-cols-6 border-t border-stroke px-5 py-4.5 dark:border-strokedark sm:grid-cols-8 md:px-6 2xl:px-7.5">
        <div className="col-span-2 flex items-center">
          <p className="font-medium">Name</p>
        </div>
        <div className="col-span-2 flex items-center">
          <p className="font-medium">ID Type</p>
        </div>
        <div className="col-span-2 flex items-center">
          <p className="font-medium">Status</p>
        </div>
        <div className="col-span-2 flex items-center">
          <p className="font-medium">Date</p>
        </div>
      </div>

      {loading ? (
        <div className="p-6">
          <LoaderSmall />
        </div>
      ) : reportCards.length === 0 ? (
        <div className="p-6 text-center">
          <p className="text-gray-500">
            No report cards found. Submit your first report!
          </p>
        </div>
      ) : (
        reportCards.map((card) => (
          <div
            className="grid grid-cols-6 border-t border-stroke px-4 py-4.5 dark:border-strokedark sm:grid-cols-8 md:px-6 2xl:px-7.5"
            key={card.id}
          >
            <div className="col-span-2 flex items-center">
              <p className="text-sm text-black dark:text-white">
                {card.fullName}
              </p>
            </div>
            <div className="col-span-2 flex items-center">
              <p className="text-sm text-black dark:text-white">
                {card.idType}
              </p>
            </div>
            <div className="col-span-2 flex items-center">
              <span
                className={`rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(card.status)}`}
              >
                {card.status.charAt(0).toUpperCase() + card.status.slice(1)}
              </span>
            </div>
            <div className="col-span-2 flex items-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {card.createdAt instanceof Date
                  ? card.createdAt.toLocaleDateString()
                  : new Date(card.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default ReportCardTable;
