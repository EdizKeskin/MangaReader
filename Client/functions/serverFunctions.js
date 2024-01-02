import axios from "axios";

export const deleteUser = async (id) => {
  "use server";
  try {
    const response = await axios.delete(
      `https://api.clerk.com/v1/users/${id}`,
      {
        headers: {
          Authorization: "Bearer " + process.env.NEXT_PUBLIC_CLERK_API_KEY,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const patchUser = async (id, data) => {
  "use server";

  const json = JSON.stringify({
    private_metadata: {
      isAdmin: data,
    },
    public_metadata: {
      isAdmin: data,
    },
  });

  try {
    const response = await axios.patch(
      `https://api.clerk.com/v1/users/${id}`,
      json,
      {
        headers: {
          Authorization: "Bearer " + process.env.NEXT_PUBLIC_CLERK_API_KEY,
          "Content-Type": "application/json",
        },
        maxBodyLength: Infinity,
      }
    );
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const deleteManga = async (id) => {
  "use server";
  try {
    const response = await axios.delete(
      process.env.NEXT_PUBLIC_MONGO_DB_URL + "manga/" + id
    );
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
export const deleteChapter = async (id) => {
  "use server";
  try {
    const response = await axios.delete(
      process.env.NEXT_PUBLIC_MONGO_DB_URL + "chapter/" + id
    );
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
