"use client";

import { useEffect, useState } from "react";
import Legal from "@/views/legal/Legal.view";
import { api } from "@/lib/api";
import { getLegalPolicyByType } from "@tapestry/api-client";

interface LegalPageClientProps {
  legalType: string;
}

export default function LegalPageClient({ legalType }: LegalPageClientProps) {
  const [content, setContent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchContent() {
      if (!legalType) {
        setError("Legal document type not specified.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const data = await getLegalPolicyByType(api, legalType);
        setContent(data);
        setError(null);
      } catch (err) {
        console.error("Error fetching legal content:", err);
        setError("Error loading legal document. Please try again later.");
      } finally {
        setLoading(false);
      }
    }

    fetchContent();
  }, [legalType]);

  if (loading) {
    return <div>Loading legal document...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  if (!content) {
    return <div>Legal document not found.</div>;
  }

  return <Legal content={content} />;
}
