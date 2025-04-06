import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import postReducer from "./postSlice";
import commentReducer from "./commentSlice";
import followReducer from "./followSlice";
import notificationReducer from "./notificationSlice";
import adminReducer from "./adminSlice";
import chatReducer from "./chatSlice";
import adminUsersReducer from "./adminUsersSlice";
import reportedPostsReducer from "./reportedPostsSlice";
import searchReducer from "./searchSlice";
import postModelReducer from "./postModelSlice";
import sentimentReducer from "./sentimentSlice";

const store = configureStore({
  reducer: {
    auth: authReducer,
    posts: postReducer,
    comments: commentReducer,
    follow: followReducer, 
    notifications: notificationReducer,
    admin: adminReducer, 
    chat: chatReducer,
    adminUsers: adminUsersReducer,
    reportedPosts: reportedPostsReducer,
    search: searchReducer,
    postModel: postModelReducer,
    sentiment: sentimentReducer,
    
  },
});

export default store;
