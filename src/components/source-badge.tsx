import { ExternalLink } from "lucide-react";
export function SourceBadge({
  url,
  platform,
  detail,
}: {
  url?: string | undefined;
  platform?: string | undefined;
  detail?: string | undefined;
}) {
  return (
    <div className="source-reference">
      {url ? (
        <a href={url} target="_blank" rel="noreferrer">
          <ExternalLink size={11} />
          Source: PERLab / {platform || new URL(url).hostname.replace(/^www\./, "")}
          <span className="source-url">{url}</span>
        </a>
      ) : (
        <span>Source: PERLab / {detail || "No supporting evidence in this collection"}</span>
      )}
      {url && detail && <small>{detail}</small>}
    </div>
  );
}
