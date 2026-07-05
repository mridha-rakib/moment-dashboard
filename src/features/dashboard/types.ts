export type AdminMapEventStatus = "upcoming" | "live" | "active";

export interface AdminMapEvent {
  id: string;
  title: string;
  status: AdminMapEventStatus;
  scheduledAt?: string | null;
  endAt?: string | null;
  latitude: number;
  longitude: number;
  locationName: string;
  category?: string | null;
  bannerImageUrl?: string | null;
  hostName?: string | null;
}
