/** Heuristics to turn Instagram-style captions into readable artwork titles. */

const PLACEHOLDER_TITLE =
  /^(artwork(\s+\d{4})?|untitled|hashtags|place|media|title)$/i;

export function isWeakTitle(title: string) {
  const t = title.trim();
  if (!t) return true;
  if (PLACEHOLDER_TITLE.test(t)) return true;
  if (/^artwork\s+\d{4}$/i.test(t)) return true;
  return false;
}

export function titleFromCaption(caption: string, year?: number | null) {
  let text = caption || "";

  text = text.replace(/Check out this post!\s*/gi, "");
  text = text.replace(/https?:\/\/\S+/gi, " ");
  text = text.replace(/@[\w.]+/g, " ");

  // Prefer meaningful words before hashtag-only noise
  const withoutTags = text
    .replace(/#[\w]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  let candidate = withoutTags;

  if (candidate.length < 3) {
    // Fall back to first readable hashtag words (camel/snake split)
    const tags = [...text.matchAll(/#([A-Za-z][\w]{2,})/g)].map((m) => m[1]);
    const readable = tags
      .filter((tag) => !/^(lakshandrawings|calgaryartist|calgaryart)$/i.test(tag))
      .map((tag) =>
        tag
          .replace(/_/g, " ")
          .replace(/([a-z])([A-Z])/g, "$1 $2")
          .toLowerCase(),
      );
    candidate = readable[0] ? capitalize(readable[0]) : "";
  }

  candidate = candidate.replace(/^[-–—,:.\s]+|[-–—,:.\s]+$/g, "").trim();

  if (candidate.length >= 3) {
    return truncate(capitalize(candidate), 80);
  }

  return year ? `Artwork ${year}` : "Artwork";
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function truncate(value: string, max: number) {
  if (value.length <= max) return value;
  return `${value.slice(0, max - 1).trimEnd()}…`;
}
