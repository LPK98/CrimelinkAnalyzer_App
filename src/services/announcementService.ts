import { isAxiosError } from "axios";
import { api } from "../api/api";
import { Announcement } from "../types/announcement";

const extractAnnouncementArray = (
  payload: unknown,
): Partial<Announcement>[] => {
  if (Array.isArray(payload)) {
    return payload as Partial<Announcement>[];
  }

  if (payload && typeof payload === "object") {
    const wrapped = payload as Record<string, unknown>;
    const candidates = [
      wrapped.data,
      wrapped.content,
      wrapped.items,
      wrapped.results,
      wrapped.announcements,
      wrapped.records,
      wrapped.list,
    ];

    for (const candidate of candidates) {
      if (Array.isArray(candidate)) {
        return candidate as Partial<Announcement>[];
      }

      if (candidate && typeof candidate === "object") {
        const nested = candidate as Record<string, unknown>;
        const nestedArrayCandidates = [
          nested.data,
          nested.content,
          nested.items,
          nested.results,
          nested.announcements,
          nested.records,
          nested.list,
        ];

        for (const nestedCandidate of nestedArrayCandidates) {
          if (Array.isArray(nestedCandidate)) {
            return nestedCandidate as Partial<Announcement>[];
          }
        }
      }
    }

    // Some APIs may return a single announcement object instead of a list.
    if (
      typeof wrapped.title === "string" &&
      typeof wrapped.message === "string"
    ) {
      return [wrapped as Partial<Announcement>];
    }
  }

  return [];
};

export const getAnnouncements = async (): Promise<Announcement[]> => {
  try {
    const endpoints = ["/api/announcements", "/announcements"];
    let announcementItems: Partial<Announcement>[] = [];

    for (const endpoint of endpoints) {
      try {
        const response = await api.get(endpoint);
        announcementItems = extractAnnouncementArray(response.data);
        break;
      } catch (error) {
        if (isAxiosError(error) && error.response?.status === 404) {
          continue;
        }

        throw error;
      }
    }

    return announcementItems.map((item, index) => ({
      ...item,
      id: String(item.id ?? `announcement-${index}`),
    })) as Announcement[];
  } catch (error) {
    console.error("Error fetching announcements:", error);
    throw error;
  }
};
