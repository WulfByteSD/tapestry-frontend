import Legal from "@/views/legal/Legal.view";
import { Metadata } from "next";
import { api } from "@/lib/api";
import { getLegalPolicies, getLegalPolicyByType } from "@tapestry/api-client";

// Force the page to revalidate on every request
export const revalidate = 0;
export const dynamic = 'force-dynamic';

// Generate dynamic metadata based on the legal type
export async function generateMetadata({ params }: { params: Promise<{ legalType: string }> }): Promise<Metadata> {
  const { legalType } = await params;

  // Guard against undefined legalType
  if (!legalType) {
    return {
      title: "Legal Document — Tapestry",
      description: "View legal documents for the Tapestry TTRPG system.",
    };
  }

  // Capitalize and format the legal type for display
  const formattedType = legalType
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  // Default metadata structure that can be customized per legal type
  const metadataMap: Record<string, Metadata> = {
    privacy: {
      title: "Privacy Policy — Tapestry",
      description:
        "Learn how Tapestry protects your data. We are committed to transparency, security, and respecting the privacy of every player and storyweaver.",
      keywords: [
        "Tapestry privacy policy",
        "TTRPG privacy",
        "tabletop gaming data security",
        "Tapestry GDPR",
        "user data privacy Tapestry",
      ],
    },
    terms: {
      title: "Terms of Service — Tapestry",
      description:
        "Review Tapestry terms of service. Understand your rights and responsibilities when using our tabletop roleplaying system and platform.",
      keywords: [
        "Tapestry terms of service",
        "TTRPG terms",
        "tabletop gaming agreement",
        "Tapestry legal terms",
      ],
    },
    "content-license": {
      title: "Content License — Tapestry",
      description:
        "Learn about the Content License for custom content created in Tapestry. Understand how your creations are protected and used.",
      keywords: [
        "Tapestry content license",
        "TTRPG content ownership",
        "user-generated content policy",
        "Tapestry custom content rights",
      ],
    },
    "storyweaver-policy": {
      title: "Storyweaver Policy — Tapestry",
      description:
        "Review the Storyweaver Policy for game masters and content creators on Tapestry. Learn about your responsibilities and capabilities.",
      keywords: [
        "Tapestry storyweaver policy",
        "game master guidelines",
        "TTRPG content creation",
        "dungeon master policy",
      ],
    },
  };

  // Return specific metadata or fallback to generic
  return (
    metadataMap[legalType] || {
      title: `${formattedType} — Tapestry`,
      description: `Read our ${formattedType.toLowerCase()} document for the Tapestry TTRPG system.`,
      keywords: [`Tapestry ${legalType}`, "TTRPG legal", "tabletop gaming documents"],
      robots: "index, follow",
    }
  );
}

interface PageProps {
  params: Promise<{
    legalType: string;
  }>;
}

export default async function Page({ params }: PageProps) {
  const { legalType } = await params;

  // Guard against undefined legalType
  if (!legalType) {
    return <div>Legal document not found.</div>;
  }

  try {
    // Fetch dynamic legal document based on the legalType parameter
    const content = await getLegalPolicyByType(api, legalType);

    return <Legal content={content} />;
  } catch (error) {
    console.error("Error fetching legal content:", error);
    return <div>Error loading legal document. Please try again later.</div>;
  }
}
