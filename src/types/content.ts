export type SiteContentType = "FAQ" | "TESTIMONIAL";

export interface SiteContent {
  id: string;
  type: SiteContentType;
  titleEn: string;
  titleBn: string | null;
  bodyEn: string;
  bodyBn: string | null;
  authorName: string | null;
  authorRole: string | null;
  avatarUrl: string | null;
  rating: number | null;
  sortOrder: number;
}
