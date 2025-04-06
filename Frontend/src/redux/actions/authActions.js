export const updateUserCoverPhoto = (coverPhotoUrl) => {
    return {
      type: 'UPDATE_COVER_PHOTO',
      payload: coverPhotoUrl,
    };
  };
  