export type AnnouncementTag = "GENERAL" | "ALERT" | "UPDATE" | "EVENT";

export type Announcement = {
  id: string;
  title: string;
  message: string;
  date?: string | Date;
  tag?: AnnouncementTag;
  status?: string;
};
