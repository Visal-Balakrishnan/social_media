import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchSentimentReport, clearSentimentReport } from "../../redux/sentimentSlice";
import { FaSmile, FaFrown } from "react-icons/fa";

const SentimentReport = ({ userId }) => {
  const dispatch = useDispatch();
  const { report, loading, error } = useSelector((state) => state.sentiment);

  useEffect(() => {
    if (userId) {
      dispatch(fetchSentimentReport(userId));
    }

    return () => {
      dispatch(clearSentimentReport());
    };
  }, [dispatch, userId]);

  if (loading) return <p className="text-center text-gray-600">Loading sentiment report...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;

  const totalComments = report ? report.positive + report.negative : 0;
  const positivePercentage = totalComments ? (report.positive / totalComments) * 100 : 0;
  const negativePercentage = totalComments ? (report.negative / totalComments) * 100 : 0;

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4 text-center">Sentiment Analysis Report</h2>

      {report ? (
        <div className="space-y-4">
          {/* Positive Comments */}
          <div className="flex items-center space-x-3">
            <FaSmile className="text-green-500 text-xl" />
            <p className="font-medium text-gray-700">Positive Comments: {report.positive}</p>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-green-500 h-3 rounded-full transition-all"
              style={{ width: `${positivePercentage}%` }}
            ></div>
          </div>

          {/* Negative Comments */}
          <div className="flex items-center space-x-3">
            <FaFrown className="text-red-500 text-xl" />
            <p className="font-medium text-gray-700">Negative Comments: {report.negative}</p>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-red-500 h-3 rounded-full transition-all"
              style={{ width: `${negativePercentage}%` }}
            ></div>
          </div>

          {/* Summary */}
          <div className="text-center mt-4">
            {positivePercentage >= 60 ? (
              <p className="text-green-600 font-semibold">Overall, you have a positive sentiment trend! 😊</p>
            ) : negativePercentage >= 60 ? (
              <p className="text-red-600 font-semibold">you havea high negative sentiment trend. 😟</p>
            ) : (
              <p className="text-gray-600 font-medium">you have a balanced sentiment trend. ⚖️</p>
            )}
          </div>
        </div>
      ) : (
        <p className="text-gray-500 text-center">No sentiment data available.</p>
      )}
    </div>
  );
};

export default SentimentReport;
