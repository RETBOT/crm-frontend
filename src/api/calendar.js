import axios from "axios";
import { refreshToken } from "./auth";

const url = import.meta.env.VITE_API_URL;

function authHeader() {
  const token = localStorage.getItem("token");
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
}

async function withRefresh(fn, ...args) {
  try {
    return await fn(...args);
  } catch (error) {
    const status = error?.response?.status;
    if (status === 401) {
      return refreshToken(fn, ...args);
    }

    const message = error?.response?.data?.message || "Error en operacion de calendario";
    throw new Error(message);
  }
}

export const syncCalendar = async (provider) =>
  withRefresh(async () => {
    const response = await axios.post(
      `${url}calendar/sync`,
      { provider },
      authHeader()
    );
    return response.data;
  });

export const getCalendarEvents = async (params = {}) =>
  withRefresh(async () => {
    const response = await axios.get(`${url}calendar/events`, {
      ...authHeader(),
      params,
    });
    return response.data;
  });

export const createActivityFromEvent = async (eventId, activityType) =>
  withRefresh(async () => {
    const response = await axios.post(
      `${url}calendar/create-activity`,
      { eventId, activityType },
      authHeader()
    );
    return response.data;
  });
