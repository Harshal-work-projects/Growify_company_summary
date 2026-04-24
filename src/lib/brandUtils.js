export const TWEAK_DEFAULTS = {
  accentColor: "#A0522D",
  cardColumns: "3",
  summaryLines: "2",
  showGroupId: true,
};

const BRAND_COLORS = [
  "#A0522D",
  "#7B6FA0",
  "#5B7FA6",
  "#4A8A6F",
  "#B87333",
  "#8B4513",
  "#9E7B5A",
  "#7A6652",
  "#6B8E6B",
  "#C4876A",
  "#8B7355",
  "#6B8E8E",
  "#A07B5A",
  "#7A7B6B",
  "#8E6B8E",
];

export function getBrandAccent(name = "") {
  let hash = 0;
  for (let index = 0; index < name.length; index += 1) {
    hash = name.charCodeAt(index) + ((hash << 5) - hash);
  }
  return BRAND_COLORS[Math.abs(hash) % BRAND_COLORS.length];
}

export function tint(hex, amount = 0.88) {
  const red = Number.parseInt(hex.slice(1, 3), 16);
  const green = Number.parseInt(hex.slice(3, 5), 16);
  const blue = Number.parseInt(hex.slice(5, 7), 16);
  const mix = (value) => Math.round(value + (255 - value) * amount);
  return `rgb(${mix(red)}, ${mix(green)}, ${mix(blue)})`;
}

export function getInitials(name = "") {
  return name
    .split(/\s+/)
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function formatDate(value) {
  try {
    return new Date(value).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return value ?? "";
  }
}

export function getUniqueWeeks(data) {
  return [...new Set(data.map((record) => record.week))].sort();
}

export function parseSummaries(raw) {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;

  if (typeof raw === "string") {
    const trimmed = raw.trim();
    if (!trimmed || trimmed === "null" || trimmed === "[]") {
      return [];
    }

    try {
      const parsed = JSON.parse(trimmed);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  return [];
}

export function parseEntry(entry = {}) {
  const text = (entry.summary || entry.dste_summary || "").trim();
  const dateKey = entry.date || entry.dste;

  const splitIndex = text.search(/Important Links\s*[:\-]*/i);
  const summaryRaw = splitIndex > -1 ? text.slice(0, splitIndex) : text;
  const linksRaw = splitIndex > -1 ? text.slice(splitIndex) : "";

  const overallMatch = (linksRaw || text).match(/Overall Summary\s*:\s*(.+)$/is);
  const overallText = overallMatch ? overallMatch[1].trim() : "";

  const fullText = [summaryRaw.replace(/Overall Summary\s*:.*/is, ""), overallText]
    .filter(Boolean)
    .join(" ")
    .trim();

  const points = fullText
    .split(".")
    .map((segment) => segment.trim())
    .filter((segment) => segment.length > 8);

  const linksOnly = linksRaw.replace(/Overall Summary\s*:.*$/is, "");
  const linkRegex =
    /\[(\d{4}-\d{2}-\d{2})\]\s+([^:]+):\s*(https?:\/\/[^\s]+?)(?=\s+-\s+\[|\s*$)/g;
  const links = [];
  const seen = new Set();
  let match;

  while ((match = linkRegex.exec(linksOnly)) !== null) {
    const url = match[3].trim();
    if (seen.has(url)) {
      continue;
    }

    seen.add(url);
    const slug =
      url.split("/products/").pop()?.split("?")[0] ||
      url.split("/collections/").pop()?.split("?")[0] ||
      "";

    const label =
      slug && slug.length < 100
        ? slug
            .replace(/-set-of-\d+$/u, "")
            .replace(/-rts$/u, "")
            .replace(/-/gu, " ")
            .replace(/\b\w/gu, (character) => character.toUpperCase())
            .trim()
        : match[2].trim();

    links.push({
      date: match[1],
      label,
      url,
    });
  }

  const grouped = links.reduce((accumulator, link) => {
    if (!accumulator[link.date]) {
      accumulator[link.date] = [];
    }
    accumulator[link.date].push(link);
    return accumulator;
  }, {});

  return { dateKey, points, links, grouped };
}
