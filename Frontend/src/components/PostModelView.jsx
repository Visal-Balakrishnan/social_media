import React, { useEffect } from "react";
import { FaTimes } from "react-icons/fa";
import { useSelector, useDispatch } from "react-redux";
import { closePostModel, fetchPostFormodel } from "../redux/postModelSlice";
import CommentsSection from "./CommentsSection";

const PostmodelView = ({ postId }) => {
  const dispatch = useDispatch();
  const { isOpen, post, loading, error } = useSelector((state) => state.postModel);

  useEffect(() => {
    if (isOpen && !post) {
      dispatch(fetchPostFormodel(postId));
    }
  }, [isOpen, postId, post, dispatch]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"; // Disable scrolling
    } else {
      document.body.style.overflow = "auto"; // Restore scrolling
    }

    // Cleanup on unmount or when isOpen changes
    return () => {
      document.body.style.overflow = "auto"; // Ensure scrolling is restored
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center z-50">
      <div className="relative bg-white w-4/5 max-h-[95vh] flex rounded-lg overflow-hidden shadow-2xl">
        
        {/* Close Button */}
        <button
          className="absolute top-4 right-4 text-white hover:text-gray-300 bg-gray-900 rounded-full p-2 z-50"
          onClick={() => dispatch(closePostModel())}
        >
          <FaTimes size={24} />
        </button>

        {/* Loading & Error Handling */}
        {loading ? (
          <div className="w-full flex justify-center items-center p-6">
            <p className="text-gray-600">Loading post...</p>
          </div>
        ) : error ? (
          <div className="w-full flex justify-center items-center p-6">
            <p className="text-red-500">{error}</p>
          </div>
        ) : (
          post && (
            <>
              {/* Image Section - Now 60% of the modal */}
              <div className="w-3/5 bg-black flex items-center justify-center p-4">
                <img
                  src={post.image}
                  alt="Post"
                  className="max-h-[90vh] max-w-full object-contain rounded-lg"
                />
              </div>

              {/* Comments Section - Now 40% of the modal */}
              <div className="w-2/5 bg-white flex flex-col p-6 overflow-hidden">
                <h3 className="text-xl font-semibold mb-2">{post?.user?.name}'s Post</h3>
                <p className="text-sm text-gray-700">{post?.caption}</p>

                {/* Comments Section with More Space */}
                <div className="flex-grow mt-4 overflow-y-auto max-h-[75vh]">
                  <CommentsSection postId={post._id} />
                </div>
              </div>
            </>
          )
        )}
      </div>
    </div>
  );
};

export default PostmodelView;
