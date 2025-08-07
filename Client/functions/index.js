import axios from "axios";
import { notFound } from "next/navigation";

export async function fetchMangaList() {
  try {
    const response = await axios.get(
      process.env.NEXT_PUBLIC_MONGO_DB_URL + "manga/list"
    );
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
}
export async function fetchMangaListHome(page, limit) {
  if (!page) {
    page = 1;
  }
  if (!limit) {
    limit = 16;
  }
  try {
    const response = await axios.get(
      process.env.NEXT_PUBLIC_MONGO_DB_URL +
        "manga/list/home?page=" +
        page +
        "&limit=" +
        limit
    );
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
}
export async function fetchMangaListAdmin() {
  try {
    const response = await axios.get(
      process.env.NEXT_PUBLIC_MONGO_DB_URL + "manga/list/admin"
    );
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export const fetchGenres = async () => {
  try {
    const response = await axios.get(
      process.env.NEXT_PUBLIC_MONGO_DB_URL + "genres/list"
    );
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const fetchAnnouncements = async (limit) => {
  try {
    const response = await axios.get(
      process.env.NEXT_PUBLIC_MONGO_DB_URL + `announcements/list/${limit}`
    );
    return response.data;
  } catch (error) {
    console.error(error);
  }
};

export const fetchGenresCount = async () => {
  try {
    const response = await axios.get(
      process.env.NEXT_PUBLIC_MONGO_DB_URL + "genres/count"
    );
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const fetchMangaCount = async () => {
  try {
    const response = await axios.get(
      process.env.NEXT_PUBLIC_MONGO_DB_URL + "manga/count"
    );
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const fetchChapterCount = async () => {
  try {
    const response = await axios.get(
      process.env.NEXT_PUBLIC_MONGO_DB_URL + "chapter/count"
    );
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const addGenre = async (genre) => {
  const response = await axios.post(
    process.env.NEXT_PUBLIC_MONGO_DB_URL + "genres/add",
    genre
  );
  return response.data;
};

export const addAnnouncement = async (announcement) => {
  try {
    const response = await axios.post(
      process.env.NEXT_PUBLIC_MONGO_DB_URL + "announcements/add",
      announcement
    );
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const addManga = async (data) => {
  try {
    const response = await axios.post(
      process.env.NEXT_PUBLIC_MONGO_DB_URL + "manga/add",
      data,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const getMangaById = async (id) => {
  try {
    const response = await axios.get(
      process.env.NEXT_PUBLIC_MONGO_DB_URL + "manga/" + id
    );
    return response.data;
  } catch (error) {
    notFound();
  }
};
export const getMangaBySlug = async (slug) => {
  try {
    const response = await axios.get(
      process.env.NEXT_PUBLIC_MONGO_DB_URL + "manga/slug/" + slug
    );
    return response.data;
  } catch (error) {
    notFound();
  }
};

export const getChaptersByMangaId = async (id) => {
  try {
    const response = await axios.get(
      process.env.NEXT_PUBLIC_MONGO_DB_URL + "manga/" + id + "/chapters"
    );
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
export const getChaptersByMangaSlug = async (slug) => {
  try {
    const response = await axios.get(
      process.env.NEXT_PUBLIC_MONGO_DB_URL + "manga/slug/" + slug + "/chapters"
    );
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
export const getUnpublishedChapters = async () => {
  try {
    const response = await axios.get(
      process.env.NEXT_PUBLIC_MONGO_DB_URL + "chapter/unpublished"
    );
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const getChapterById = async (id) => {
  try {
    const response = await axios.get(
      process.env.NEXT_PUBLIC_MONGO_DB_URL + "chapter/" + id
    );
    return response.data;
  } catch (error) {
    notFound();
  }
};
export const getChapterBySlug = async (id, mangaSlug) => {
  try {
    const response = await axios.get(
      process.env.NEXT_PUBLIC_MONGO_DB_URL +
        "chapter/slug/" +
        mangaSlug +
        "/" +
        id
    );
    return response.data;
  } catch (error) {
    console.log(error);
    // notFound();
  }
};

export const getUserCount = async () => {
  try {
    const response = await axios.get("https://api.clerk.com/v1/users/count", {
      headers: {
        Authorization: "Bearer " + process.env.CLERK_SECRET_KEY,
      },
    });
    return response.data.total_count;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const getUsers = async () => {
  try {
    const response = await axios.get(
      "https://api.clerk.com/v1/users?limit=500&offset=0&order_by=-created_at",
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

export const getChapterList = async () => {
  try {
    const response = await axios.get(
      process.env.NEXT_PUBLIC_MONGO_DB_URL + "chapter/list"
    );
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const getMangaNames = async () => {
  try {
    const response = await axios.get(
      process.env.NEXT_PUBLIC_MONGO_DB_URL + "manga/list/name"
    );
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const addChapter = async (data) => {
  try {
    const response = await axios.post(
      process.env.NEXT_PUBLIC_MONGO_DB_ADMIN_URL + "chapter/add",
      data,
      {
        headers: { "Content-Type": "application/json" },
      }
    );
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const patchManga = async (id, data) => {
  try {
    const response = await axios.patch(
      process.env.NEXT_PUBLIC_MONGO_DB_URL + "manga/" + id,
      data,
      {
        headers: { "Content-Type": "application/json" },
      }
    );
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
export const deleteGenre = async (id) => {
  try {
    const response = await axios.delete(
      process.env.NEXT_PUBLIC_MONGO_DB_URL + "genres/" + id
    );
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
export const deleteAnnouncement = async (id) => {
  console.log("Deleting announcement with ID:", id);
  try {
    const response = await axios.delete(
      process.env.NEXT_PUBLIC_MONGO_DB_URL + "announcements/" + id
    );
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const getAnnouncementById = async (id) => {
  try {
    const response = await axios.get(
      process.env.NEXT_PUBLIC_MONGO_DB_URL + "announcements/" + id
    );
    return response.data;
  } catch (error) {
    console.error(error);
  }
};

export const patchGenre = async (id, genre) => {
  try {
    const response = await axios.patch(
      process.env.NEXT_PUBLIC_MONGO_DB_URL + "genres/" + id,
      genre
    );
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const patchAnnouncement = async (id, announcement) => {
  console.log("Adding announcement:", announcement);
  try {
    const response = await axios.patch(
      process.env.NEXT_PUBLIC_MONGO_DB_URL + "announcements/" + id,
      announcement
    );
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const patchChapter = async (id, data) => {
  try {
    const response = await axios.patch(
      process.env.NEXT_PUBLIC_MONGO_DB_URL + "chapter/" + id,
      data,
      {
        headers: { "Content-Type": "application/json" },
      }
    );
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const getMangaByGenreId = async (id) => {
  try {
    const response = await axios.get(
      process.env.NEXT_PUBLIC_MONGO_DB_URL + "genres/" + id + "/mangas"
    );
    return response.data;
  } catch (error) {
    console.error(error);
    if (error.response) {
      return error.response.status;
    }
    throw error;
  }
};

export const getMangaByStatus = async (status) => {
  try {
    const response = await axios.get(
      process.env.NEXT_PUBLIC_MONGO_DB_URL + "manga/list/status/" + status
    );
    return response.data;
  } catch (error) {
    console.error(error);
    if (error.response && error.response.status === 404) {
      return 404;
    }
    throw error;
  }
};

export const getGenreById = async (id) => {
  try {
    const response = await axios.get(
      process.env.NEXT_PUBLIC_MONGO_DB_URL + "genres/" + id
    );
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const getMangaByAuthor = async (author) => {
  try {
    const response = await axios.get(
      process.env.NEXT_PUBLIC_MONGO_DB_URL + "manga/author?author=" + author
    );
    return response.data;
  } catch (error) {
    console.error("error");
  }
};

export const getMangaByArtist = async (artist) => {
  try {
    const response = await axios.get(
      process.env.NEXT_PUBLIC_MONGO_DB_URL + "manga/artist?artist=" + artist
    );
    return response.data;
  } catch (error) {
    console.error("error");
  }
};

export const uploadFileToServer = async (file) => {
  const formData = new FormData();
  formData.append("image", file);

  try {
    const response = await axios.post(
      process.env.NEXT_PUBLIC_MONGO_DB_URL + "files/upload",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    console.log(response.data);
    return response.data.url;
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const addSubscriber = async (data) => {
  try {
    const response = await axios.post(
      process.env.NEXT_PUBLIC_MONGO_DB_URL + "subscriber/add",
      data
    );
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const getSubscriber = async (userId) => {
  try {
    const response = await axios.get(
      process.env.NEXT_PUBLIC_MONGO_DB_URL + "subscriber/" + userId
    );
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
export const patchSubscriber = async (data) => {
  try {
    const response = await axios.patch(
      process.env.NEXT_PUBLIC_MONGO_DB_URL + "subscriber/update",
      data
    );
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const deleteSubscriber = async (userId) => {
  try {
    const response = await axios.delete(
      process.env.NEXT_PUBLIC_MONGO_DB_URL + "subscriber/delete/" + userId
    );
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
export const getSubscriberList = async () => {
  try {
    const response = await axios.get(
      process.env.NEXT_PUBLIC_MONGO_DB_URL + "subscriber/"
    );
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const getSubscriberCount = async () => {
  try {
    const response = await axios.get(
      process.env.NEXT_PUBLIC_MONGO_DB_URL + "subscriber/"
    );
    return response.data.length;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const wakeUpAdmin = async () => {
  try {
    const response = await axios.get(
      process.env.NEXT_PUBLIC_MONGO_DB_ADMIN_URL + "wakeup"
    );
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
export const getAllMangaSlugs = async () => {
  try {
    const response = await axios.get(
      process.env.NEXT_PUBLIC_MONGO_DB_URL + "manga/list"
    );
    return response.data.map((manga) => ({
      slug: manga.slug,
    }));
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const getChaptersSlugs = async (slug) => {
  try {
    const response = await axios.get(
      process.env.NEXT_PUBLIC_MONGO_DB_URL + "manga/slug/" + slug + "/chapters"
    );
    return response.data.chapters.map((chapter) => ({
      slug: chapter.slug,
    }));
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const fetchRandomChapters = async (limit = 15) => {
  try {
    const response = await axios.get(
      process.env.NEXT_PUBLIC_MONGO_DB_URL +
        "manga/random-chapters?limit=" +
        limit
    );
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
