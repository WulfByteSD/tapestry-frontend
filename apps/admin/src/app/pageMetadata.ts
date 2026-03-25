import type { Metadata } from "next";

type AdminPageMetadataOptions = {
  title: string;
  description: string;
};

export function createAdminPageMetadata({ title, description }: AdminPageMetadataOptions): Metadata {
  return {
    title,
    description,
    robots: {
      index: false,
      follow: false,
    },
  };
}
