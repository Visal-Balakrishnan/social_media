import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchNegativeSentimentUsers } from "../redux/adminSlice";
import { toast } from "react-hot-toast";
import { Link } from "react-router-dom";

const SentimentReport = () => {
  const dispatch = useDispatch();
  const { negativeUsers, sentimentLoading, sentimentError } = useSelector((state) => state.admin);

  useEffect(() => {
    dispatch(fetchNegativeSentimentUsers());
  }, [dispatch]);

  if (sentimentLoading)
    return <p className="text-center text-gray-600 text-lg">Loading sentiment report...</p>;

  if (sentimentError) {
    toast.error(sentimentError);
    return <p className="text-red-500 text-center">Failed to load sentiment report.</p>;
  }

  return (
    <div className="w-full max-w-5xl bg-white p-6 shadow-lg rounded-lg mt-6 mx-auto">
      <h3 className="text-3xl font-semibold text-gray-800 mb-6 text-center">
        📊  Sentiment report
      </h3>

      {negativeUsers.length === 0 ? (
        <p className="text-center text-gray-600 text-lg">No users with high negative sentiment.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-200 text-gray-700">
                <th className="p-4 border">Profile</th>
                <th className="p-4 border">User</th>
                <th className="p-4 border">Email</th>
                <th className="p-4 border">Negative %</th>
                <th className="p-4 border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {negativeUsers.map((user) => (
                console.log(user),
                <tr key={user._id} className="border-b hover:bg-gray-100 transition-all">
                  <td className="p-4 border text-center">
                    <img
                      src={user.profilePic || "/default-profile.png"}
                      alt="Profile"
                      className="w-12 h-12 rounded-full mx-auto shadow"
                    />
                  </td>
                  <td className="p-4 border text-center">{user.name}</td>
                  <td className="p-4 border text-center">{user.email}</td>
                  <td className="p-4 border text-center text-red-500 font-semibold">
                    {user.negativePercentage.toFixed(2)}%
                  </td>
                  <td className="p-4 border text-center">
                    <Link
                      to={`/profile/${user._id}`}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-all"
                    >
                      View Profile
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default SentimentReport;
