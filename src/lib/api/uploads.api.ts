import { api } from "./client";

export interface UploadResultDTO {
  url: string;
  publicId: string;
}

export const uploadsApi = {
  image: (
    shopId: string,
    file: File,
    purpose: "product" | "shop_logo" | "shop" | "inbox" | "hisab",
  ) => {
    const body = new FormData();
    body.append("file", file);
    body.append("purpose", purpose === "shop_logo" ? "shop" : purpose);
    return api
      .post<{ data: UploadResultDTO }>(`/shops/${shopId}/uploads/image`, body)
      .then((response) => response.data.data);
  },
};
