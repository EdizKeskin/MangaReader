export function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function unixTimeStampToDateTime(unixTimeStamp) {
  const timestampInSeconds = unixTimeStamp / 1000;
  const date = new Date(timestampInSeconds * 1000);

  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");

  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const seconds = date.getSeconds().toString().padStart(2, "0");

  const formattedDate = `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;

  return formattedDate;
}

export function formatDateToCustomFormat(date) {
  const options = {
    day: "numeric",
    month: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  };

  const formattedDate = new Intl.DateTimeFormat("tr-TR", options).format(date);

  return formattedDate;
}
export function dateForChapters(input) {
  const date = new Date(input);

  const month = date.toLocaleString("default", { month: "long" });
  const day = date.getDate();
  const year = date.getFullYear();

  return `${month} ${day}, ${year}`;
}

export const getDayDifference = (expireAt) => {
  const currentDate = new Date();
  const expireAtDate = new Date(expireAt);

  const timeDifference = expireAtDate - currentDate;

  const dayDifference = Math.floor(timeDifference / (1000 * 60 * 60 * 24));

  return dayDifference;
};
