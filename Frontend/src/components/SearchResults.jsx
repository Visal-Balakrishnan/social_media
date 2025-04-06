import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import { fetchSearchResults, clearSearchResults } from "../redux/searchSlice";

const SearchResults = () => {
  const location = useLocation();
  const query = new URLSearchParams(location.search).get("q");

  const dispatch = useDispatch();
  const { users, posts, loading, error } = useSelector((state) => state.search);

  useEffect(() => {
    if (query) {
      dispatch(fetchSearchResults(query));
    }

    return () => {
      dispatch(clearSearchResults()); // Clear results when leaving the page
    };
  }, [dispatch, query]);

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Search Results for "{query}"</h2>

      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {!loading && !error && (
        <>
          {users.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-2">Users</h3>
              <ul>
                {users.map((user) => (
                  <li key={user._id} className="p-2 border-b">
                    <a href={`/profile/${user._id}`} className="text-blue-500">
                      {user.username}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {posts.length > 0 && (
            <div className="mt-4">
              <h3 className="text-lg font-semibold mb-2">Posts</h3>
              <ul>
                {posts.map((post) => (
                  <li key={post._id} className="p-2 border-b">
                    <p className="font-bold">{post.author.username}</p>
                    <p>{post.content}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {users.length === 0 && posts.length === 0 && <p>No results found.</p>}
        </>
      )}
    </div>
  );
};

export default SearchResults;
