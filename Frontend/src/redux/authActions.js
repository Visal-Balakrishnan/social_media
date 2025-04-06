import axios from "axios";
import { loginSuccess, logout, updateUserCoverPhoto } from "./authSlice";

// Login Action
export const loginUser = (email, password) => async (dispatch) => {
  try {
    const response = await axios.post(
      "http://localhost:7000/api/auth/login",
      { email, password },
      { withCredentials: true } 
    );

    dispatch(loginSuccess({ user: response.data.user, token: response.data.token }));
  } catch (error) {
    console.error("Login error:", error.response?.data?.message);
  }
};

// Logout Action
export const logoutUser = () => async (dispatch) => {
  try {
    await axios.post("http://localhost:7000/api/auth/logout", {}, { withCredentials: true });
  } catch (error) {
    console.error("Logout error:", error.response?.data?.message);
  }
  dispatch(logout()); // ✅ Ensures logout even if the request fails
};

// Upload Cover Photo Action
export const uploadCoverPhoto = (coverPhotoFile) => async (dispatch) => {
  try {
    const formData = new FormData();
    formData.append("coverPhoto", coverPhotoFile);

    const response = await axios.put(
      "http://localhost:7000/api/user/cover-photo",
      formData,
      {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      }
    );

    dispatch(updateUserCoverPhoto(response.data.coverPhoto.url));
  } catch (error) {
    console.error("Error uploading cover photo:", error.response?.data?.message);
  }
};
