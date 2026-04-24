import { useEffect, useMemo, useState } from "react";
import {
  TWEAK_DEFAULTS,
  formatDate,
  getBrandAccent,
  getInitials,
  getUniqueWeeks,
  parseEntry,
  parseSummaries,
  tint,
} from "./lib/brandUtils";

function Icon({ name, size = 16, color = "currentColor" }) {
  const icons = {
    search: (
      <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
        <circle cx="7" cy="7" r="4.5" stroke={color} strokeWidth="1.5" />
        <path d="M10.5 10.5L13 13" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
    chevronDown: (
      <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
        <path
          d="M4 6l4 4 4-4"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    close: (
      <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
        <path d="M4 4l8 8M12 4l-8 8" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
    calendar: (
      <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
        <rect x="2" y="3.5" width="12" height="11" rx="2" stroke={color} strokeWidth="1.5" />
        <path
          d="M2 7h12M5.5 2v3M10.5 2v3"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    ),
    database: (
      <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
        <ellipse cx="8" cy="4.5" rx="5" ry="2" stroke={color} strokeWidth="1.5" />
        <path
          d="M3 4.5v7c0 1.1 2.24 2 5 2s5-.9 5-2v-7"
          stroke={color}
          strokeWidth="1.5"
        />
        <path d="M3 8c0 1.1 2.24 2 5 2s5-.9 5-2" stroke={color} strokeWidth="1.5" />
      </svg>
    ),
    tag: (
      <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
        <path
          d="M2 2h5.5l6.5 6.5-5 5L2.5 7V2H2z"
          stroke={color}
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <circle cx="5.5" cy="5.5" r="1" fill={color} />
      </svg>
    ),
    arrowRight: (
      <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
        <path
          d="M3 8h10M9 4l4 4-4 4"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    loader: (
      <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
        <circle
          cx="8"
          cy="8"
          r="6"
          stroke={color}
          strokeWidth="1.5"
          strokeDasharray="20 10"
          strokeLinecap="round"
        >
          <animateTransform
            attributeName="transform"
            type="rotate"
            from="0 8 8"
            to="360 8 8"
            dur="0.8s"
            repeatCount="indefinite"
          />
        </circle>
      </svg>
    ),
    grid: (
      <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
        <rect x="2" y="2" width="5" height="5" rx="1" stroke={color} strokeWidth="1.5" />
        <rect x="9" y="2" width="5" height="5" rx="1" stroke={color} strokeWidth="1.5" />
        <rect x="2" y="9" width="5" height="5" rx="1" stroke={color} strokeWidth="1.5" />
        <rect x="9" y="9" width="5" height="5" rx="1" stroke={color} strokeWidth="1.5" />
      </svg>
    ),
    plug: (
      <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
        <path
          d="M6 2v4M10 2v4M4 6h8l-1 5H5L4 6z"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="M8 11v3" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
    refresh: (
      <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
        <path
          d="M2 8a6 6 0 1 0 1.5-4L2 2v4h4"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    warning: (
      <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
        <path
          d="M8 2.5l6 10.5H2L8 2.5z"
          stroke={color}
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <path d="M8 6v3.2" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="8" cy="11.3" r="0.7" fill={color} />
      </svg>
    ),
  };

  return icons[name] || null;
}

function MetaTag({ icon, label }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        fontSize: 12,
        color: "#7A6252",
        background: "#F2EBE2",
        borderRadius: 6,
        padding: "3px 8px",
      }}
    >
      <Icon name={icon} size={11} color="#9A8878" /> {label}
    </span>
  );
}

function StatCard({ label, value, icon, accent }) {
  return (
    <div
      style={{
        background: "#FFFDF9",
        border: "1.5px solid #E8DDD1",
        borderRadius: 14,
        padding: "16px 20px",
        display: "flex",
        alignItems: "center",
        gap: 14,
        boxShadow: "0 2px 8px rgba(80, 50, 20, 0.05)",
      }}
    >
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: 11,
          background: tint(accent, 0.85),
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <Icon name={icon} size={18} color={accent} />
      </div>
      <div>
        <div
          style={{
            fontSize: 24,
            fontWeight: 700,
            color: "#2C1F14",
            lineHeight: 1,
            fontFamily: "'Playfair Display', serif",
          }}
        >
          {value}
        </div>
        <div style={{ fontSize: 11, color: "#B5A898", marginTop: 3, letterSpacing: 0.5 }}>
          {label}
        </div>
      </div>
    </div>
  );
}

function BrandCard({ record, onClick, summaryLines, showGroupId }) {
  const [hovered, setHovered] = useState(false);
  const brandAccent = getBrandAccent(record.Brand);
  const entries = parseSummaries(record.summary);
  const latest = entries[0];
  const { points } = latest ? parseEntry(latest) : { points: [] };
  const previewPoints = points.slice(0, summaryLines === "1" ? 1 : 2);
  const totalLinks = entries.reduce((sum, entry) => sum + parseEntry(entry).links.length, 0);

  return (
    <div
      onClick={() => onClick(record)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? tint(brandAccent, 0.93) : "#FFFDF9",
        border: `1.5px solid ${hovered ? `${brandAccent}70` : "#E8DDD1"}`,
        borderRadius: 16,
        padding: "20px 20px 18px",
        cursor: "pointer",
        transition: "all 0.2s ease",
        transform: hovered ? "translateY(-2px)" : "none",
        boxShadow: hovered
          ? `0 10px 32px ${brandAccent}22`
          : "0 2px 8px rgba(80, 50, 20, 0.05)",
        animation: "cardIn 0.35s ease both",
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 14 }}>
        <div
          style={{
            width: 42,
            height: 42,
            borderRadius: 12,
            flexShrink: 0,
            background: tint(brandAccent, 0.78),
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 14,
            fontWeight: 700,
            color: brandAccent,
            fontFamily: "'Playfair Display', serif",
          }}
        >
          {getInitials(record.Brand)}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontWeight: 700,
              fontSize: 14,
              color: "#2C1F14",
              lineHeight: 1.3,
              fontFamily: "'Playfair Display', serif",
              wordBreak: "break-word",
            }}
          >
            {record.Brand}
          </div>
          {showGroupId && (
            <div
              style={{
                fontSize: 10,
                color: "#B5A898",
                marginTop: 3,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {record.group_id}
            </div>
          )}
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
            gap: 4,
            flexShrink: 0,
          }}
        >
          <span
            style={{
              fontSize: 10,
              fontWeight: 600,
              color: entries.length > 0 ? brandAccent : "#C4BAB0",
              background: entries.length > 0 ? tint(brandAccent, 0.88) : "#F5F0EA",
              borderRadius: 20,
              padding: "2px 9px",
              whiteSpace: "nowrap",
            }}
          >
            {entries.length} {entries.length === 1 ? "entry" : "entries"}
          </span>
          {totalLinks > 0 && <span style={{ fontSize: 10, color: "#B5A898" }}>links {totalLinks}</span>}
        </div>
      </div>

      <div style={{ fontSize: 10, color: "#B5A898", marginBottom: 12, letterSpacing: 0.3 }}>
        {record.week}
      </div>

      <div style={{ height: 1, background: `${brandAccent}18`, marginBottom: 12 }} />

      {entries.length === 0 ? (
        <p style={{ fontSize: 12, color: "#C4BAB0", fontStyle: "italic", margin: 0 }}>
          No summaries available.
        </p>
      ) : (
        <>
          <div
            style={{
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: 2,
              color: brandAccent,
              textTransform: "uppercase",
              marginBottom: 8,
              opacity: 0.8,
            }}
          >
            Latest · {formatDate(latest.date || latest.dste)}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {previewPoints.map((point, index) => (
              <div key={`${record.id}-${index}`} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                <span
                  style={{
                    width: 4,
                    height: 4,
                    borderRadius: "50%",
                    background: brandAccent,
                    flexShrink: 0,
                    marginTop: 6,
                  }}
                />
                <span
                  style={{
                    fontSize: 12,
                    color: "#5C4A3A",
                    lineHeight: 1.7,
                    fontStyle: "italic",
                    overflow: "hidden",
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                  }}
                >
                  {point}
                </span>
              </div>
            ))}
            {entries.length > 1 && (
              <div
                style={{
                  fontSize: 11,
                  color: brandAccent,
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  marginTop: 2,
                }}
              >
                +{entries.length - 1} more entries
                <Icon name="arrowRight" size={12} color={brandAccent} />
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function SidePanel({ record, onClose }) {
  const [openLinks, setOpenLinks] = useState({});
  const entries = parseSummaries(record.summary);
  const brandAccent = getBrandAccent(record.Brand);

  useEffect(() => {
    const handler = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const toggleLinks = (index) => {
    setOpenLinks((current) => ({ ...current, [index]: !current[index] }));
  };

  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(44, 31, 20, 0.2)",
          zIndex: 100,
          animation: "fadeIn 0.2s ease",
          backdropFilter: "blur(2px)",
        }}
      />
      <div
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          bottom: 0,
          width: "min(500px, 95vw)",
          background: "#FFFDF9",
          zIndex: 101,
          borderLeft: "1.5px solid #E5D9CC",
          boxShadow: "-12px 0 48px rgba(44, 31, 20, 0.1)",
          display: "flex",
          flexDirection: "column",
          animation: "slideIn 0.28s cubic-bezier(0.22, 1, 0.36, 1)",
        }}
      >
        <div style={{ padding: "24px 28px 20px", borderBottom: "1.5px solid #EDE4D8", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div
              style={{
                width: 50,
                height: 50,
                borderRadius: 13,
                flexShrink: 0,
                background: tint(brandAccent, 0.78),
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 17,
                fontWeight: 700,
                color: brandAccent,
                fontFamily: "'Playfair Display', serif",
              }}
            >
              {getInitials(record.Brand)}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontSize: 18,
                  fontWeight: 700,
                  color: "#2C1F14",
                  fontFamily: "'Playfair Display', serif",
                  lineHeight: 1.25,
                }}
              >
                {record.Brand}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 5, flexWrap: "wrap" }}>
                <span style={{ fontSize: 12, color: "#9A8878", display: "flex", alignItems: "center", gap: 4 }}>
                  <Icon name="calendar" size={12} color="#B5A898" /> {record.week}
                </span>
                <span style={{ fontSize: 12, color: "#C4BAB0" }}>·</span>
                <span style={{ fontSize: 12, color: "#9A8878" }}>
                  {entries.length} {entries.length === 1 ? "entry" : "entries"}
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                border: "1.5px solid #DDD0C0",
                background: "#F9F4EE",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Icon name="close" size={14} color="#9A8878" />
            </button>
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 14, flexWrap: "wrap" }}>
            {record.group_id && <MetaTag icon="tag" label={`Group: ${record.group_id}`} />}
            {record.id && <MetaTag icon="database" label={`ID: ${record.id}`} />}
          </div>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "24px 28px" }}>
          <div
            style={{
              fontSize: 10,
              fontWeight: 700,
              color: "#C4B5A5",
              letterSpacing: 2,
              textTransform: "uppercase",
              marginBottom: 20,
            }}
          >
            Daily Summaries
          </div>

          {entries.length === 0 ? (
            <p style={{ color: "#C4BAB0", fontSize: 13, fontStyle: "italic" }}>
              No summaries available this period.
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column" }}>
              {entries.map((entry, index) => {
                const { dateKey, points, links, grouped } = parseEntry(entry);
                const isOpen = Boolean(openLinks[index]);

                return (
                  <div key={`${record.id}-${dateKey}-${index}`} style={{ display: "flex", gap: 0, position: "relative" }}>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        marginRight: 16,
                        width: 18,
                        flexShrink: 0,
                      }}
                    >
                      <div
                        style={{
                          width: 10,
                          height: 10,
                          borderRadius: "50%",
                          background: brandAccent,
                          border: `2px solid ${brandAccent}33`,
                          marginTop: 4,
                          zIndex: 1,
                          flexShrink: 0,
                        }}
                      />
                      {index < entries.length - 1 && (
                        <div style={{ width: 2, flex: 1, background: "#EDE4D8", marginTop: 4 }} />
                      )}
                    </div>

                    <div style={{ flex: 1, paddingBottom: index < entries.length - 1 ? 28 : 0 }}>
                      <div
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 6,
                          background: tint(brandAccent, 0.88),
                          borderRadius: 20,
                          padding: "3px 12px",
                          marginBottom: 14,
                          fontSize: 11,
                          fontWeight: 600,
                          color: brandAccent,
                        }}
                      >
                        {formatDate(dateKey)}
                      </div>

                      <div
                        style={{
                          fontSize: 9,
                          fontWeight: 700,
                          letterSpacing: 2,
                          color: "#C4B5A5",
                          textTransform: "uppercase",
                          marginBottom: 10,
                        }}
                      >
                        Summary
                      </div>

                      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
                        {points.length === 0 ? (
                          <p style={{ fontSize: 13, color: "#C4BAB0", fontStyle: "italic", margin: 0 }}>
                            No summary text found.
                          </p>
                        ) : (
                          points.map((point, pointIndex) => (
                            <div key={`${dateKey}-${pointIndex}`} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                              <span
                                style={{
                                  width: 5,
                                  height: 5,
                                  borderRadius: "50%",
                                  background: brandAccent,
                                  flexShrink: 0,
                                  marginTop: 7,
                                }}
                              />
                              <span style={{ fontSize: 13, color: "#4A3728", lineHeight: 1.75, fontStyle: "italic" }}>
                                {point}
                              </span>
                            </div>
                          ))
                        )}
                      </div>

                      {links.length > 0 && (
                        <div>
                          <button
                            onClick={() => toggleLinks(index)}
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 7,
                              background: isOpen ? brandAccent : "white",
                              color: isOpen ? "white" : brandAccent,
                              border: `1.5px solid ${brandAccent}`,
                              borderRadius: 20,
                              padding: "5px 14px",
                              fontSize: 11,
                              fontWeight: 700,
                              letterSpacing: 0.8,
                              textTransform: "uppercase",
                              cursor: "pointer",
                              transition: "all 0.18s ease",
                              fontFamily: "'Lora', serif",
                              marginBottom: isOpen ? 10 : 0,
                            }}
                          >
                            Links ({links.length})
                            <span style={{ fontSize: 8 }}>{isOpen ? "▲" : "▼"}</span>
                          </button>

                          {isOpen && (
                            <div
                              style={{
                                border: "1px solid #EDE4D8",
                                borderRadius: 10,
                                overflow: "hidden",
                                background: "white",
                              }}
                            >
                              {Object.entries(grouped).map(([date, items], groupIndex) => (
                                <div key={date}>
                                  <div
                                    style={{
                                      padding: "7px 14px",
                                      background: tint(brandAccent, 0.9),
                                      fontSize: 10,
                                      fontWeight: 700,
                                      color: brandAccent,
                                      letterSpacing: 1,
                                      textTransform: "uppercase",
                                      borderTop: groupIndex > 0 ? "1px solid #F3EDE6" : "none",
                                    }}
                                  >
                                    {formatDate(date)}
                                  </div>
                                  {items.map((link, linkIndex) => (
                                    <div
                                      key={`${date}-${linkIndex}`}
                                      style={{
                                        display: "flex",
                                        alignItems: "flex-start",
                                        gap: 10,
                                        padding: "10px 14px",
                                        borderTop: "1px solid #FAF6F1",
                                      }}
                                    >
                                      <span
                                        style={{
                                          width: 4,
                                          height: 4,
                                          borderRadius: "50%",
                                          background: "#D4C4B0",
                                          flexShrink: 0,
                                          marginTop: 5,
                                        }}
                                      />
                                      <a
                                        href={link.url}
                                        target="_blank"
                                        rel="noreferrer"
                                        style={{
                                          fontSize: 12,
                                          color: "#4A3728",
                                          textDecoration: "none",
                                          borderBottom: `1px dashed ${brandAccent}80`,
                                          lineHeight: 1.6,
                                          paddingBottom: 1,
                                          wordBreak: "break-word",
                                        }}
                                      >
                                        {link.label}
                                      </a>
                                    </div>
                                  ))}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function SetupCard({ accent }) {
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ width: "100%", maxWidth: 520 }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 16,
              background: `linear-gradient(135deg, ${accent}, ${accent}AA)`,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 16,
            }}
          >
            <Icon name="warning" size={24} color="#fff" />
          </div>
          <h1
            style={{
              fontSize: 28,
              fontWeight: 700,
              color: "#2C1F14",
              fontFamily: "'Playfair Display', serif",
            }}
          >
            Backend setup needed
          </h1>
          <p style={{ color: "#7A6252", fontSize: 15, marginTop: 10, lineHeight: 1.7 }}>
            This app is now wired for deployment through a backend server. Add your Supabase values to
            <code style={{ marginLeft: 4 }}>.env</code>, then restart the server.
          </p>
        </div>

        <div
          style={{
            background: "#FFFDF9",
            borderRadius: 18,
            border: "1.5px solid #E8DDD1",
            padding: 28,
            boxShadow: "0 4px 24px rgba(80, 50, 20, 0.08)",
          }}
        >
          <div style={{ display: "grid", gap: 10, fontSize: 14, color: "#5C4A3A" }}>
            <div><code>SUPABASE_URL</code> your project URL</div>
            <div><code>SUPABASE_KEY</code> service role key or an anon key with correct RLS access</div>
            <div><code>SUPABASE_TABLE</code> your summaries table name</div>
            <div><code>SUPABASE_SCHEMA</code> optional, defaults to <code>public</code></div>
          </div>
          <div
            style={{
              marginTop: 18,
              padding: "12px 14px",
              borderRadius: 10,
              background: tint(accent, 0.92),
              color: "#6B4A33",
              fontSize: 13,
              lineHeight: 1.6,
            }}
          >
            If you want the UI to stay usable before configuration, set <code>USE_DEMO_DATA=true</code>.
          </div>
        </div>
      </div>
    </div>
  );
}

function Dashboard({ data, config, tweaks, onRefresh, loading }) {
  const [search, setSearch] = useState("");
  const [weekFilter, setWeekFilter] = useState("all");
  const [sortBy, setSortBy] = useState("brand");
  const [selected, setSelected] = useState(null);

  const cols = Number.parseInt(tweaks.cardColumns, 10) || 3;
  const weeks = useMemo(() => getUniqueWeeks(data), [data]);
  const brands = useMemo(() => [...new Set(data.map((record) => record.Brand))], [data]);
  const totalEntries = useMemo(
    () => data.reduce((sum, record) => sum + parseSummaries(record.summary).length, 0),
    [data],
  );

  const filtered = useMemo(() => {
    const next = data.filter((record) => {
      const matchesBrand = (record.Brand || "").toLowerCase().includes(search.toLowerCase());
      const matchesWeek = weekFilter === "all" || record.week === weekFilter;
      return matchesBrand && matchesWeek;
    });

    if (sortBy === "brand") {
      next.sort((left, right) => left.Brand.localeCompare(right.Brand));
    }
    if (sortBy === "week") {
      next.sort((left, right) => left.week.localeCompare(right.week));
    }
    if (sortBy === "entries") {
      next.sort(
        (left, right) =>
          parseSummaries(right.summary).length - parseSummaries(left.summary).length,
      );
    }

    return next;
  }, [data, search, sortBy, weekFilter]);

  return (
    <div style={{ minHeight: "100vh" }}>
      <nav
        style={{
          background: "rgba(255, 252, 248, 0.95)",
          backdropFilter: "blur(12px)",
          borderBottom: "1.5px solid #E5D9CC",
          padding: "0 32px",
          display: "flex",
          alignItems: "center",
          height: 60,
          gap: 14,
          position: "sticky",
          top: 0,
          zIndex: 50,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, minWidth: 0 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 9,
              background: `linear-gradient(135deg, ${tweaks.accentColor}, ${tweaks.accentColor}BB)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon name="grid" size={16} color="#fff" />
          </div>
          <span
            style={{
              fontWeight: 700,
              fontSize: 16,
              color: "#2C1F14",
              fontFamily: "'Playfair Display', serif",
              letterSpacing: "-0.2px",
            }}
          >
            Brand Summary
          </span>
          <span style={{ fontSize: 13, color: "#D4C4B0", marginLeft: 4 }}>/</span>
          <span style={{ fontSize: 12, color: "#9A8878", fontFamily: "monospace" }}>
            {config.table || "brand_summaries"}
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button
            onClick={onRefresh}
            disabled={loading}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "7px 13px",
              borderRadius: 8,
              border: "1.5px solid #DDD0C0",
              background: "#FAF6F1",
              cursor: "pointer",
              fontSize: 12,
              color: "#7A6252",
              fontFamily: "inherit",
            }}
          >
            <Icon name="refresh" size={13} color={loading ? tweaks.accentColor : "#9A8878"} />
            {loading ? "Refreshing..." : "Refresh"}
          </button>
        </div>
      </nav>

      <main style={{ maxWidth: 1300, margin: "0 auto", padding: "28px 32px 80px" }}>
        {config.source === "demo" && (
          <div
            style={{
              marginBottom: 20,
              padding: "12px 16px",
              borderRadius: 12,
              background: tint(tweaks.accentColor, 0.93),
              border: `1px solid ${tweaks.accentColor}33`,
              color: "#6B4A33",
              display: "flex",
              alignItems: "center",
              gap: 10,
              lineHeight: 1.6,
            }}
          >
            <Icon name="warning" size={16} color={tweaks.accentColor} />
            {config.configured
              ? "The backend is configured, but demo data is currently enabled."
              : "The backend is not configured yet, so the dashboard is showing demo data."}
          </div>
        )}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: 14,
            marginBottom: 24,
          }}
        >
          <StatCard label="Total Records" value={data.length} icon="database" accent={tweaks.accentColor} />
          <StatCard label="Unique Brands" value={brands.length} icon="tag" accent={tweaks.accentColor} />
          <StatCard label="Weeks Covered" value={weeks.length} icon="calendar" accent={tweaks.accentColor} />
          <StatCard label="Total Entries" value={totalEntries} icon="grid" accent={tweaks.accentColor} />
        </div>

        <div
          style={{
            background: "#FFFDF9",
            border: "1.5px solid #E8DDD1",
            borderRadius: 14,
            padding: "14px 18px",
            display: "flex",
            gap: 12,
            alignItems: "center",
            marginBottom: 20,
            flexWrap: "wrap",
            boxShadow: "0 2px 8px rgba(80, 50, 20, 0.04)",
          }}
        >
          <div style={{ position: "relative", flex: "1 1 200px", minWidth: 180 }}>
            <span
              style={{
                position: "absolute",
                left: 11,
                top: "50%",
                transform: "translateY(-50%)",
                pointerEvents: "none",
              }}
            >
              <Icon name="search" size={14} color="#C4B5A5" />
            </span>
            <input
              placeholder="Search brand..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              style={{
                width: "100%",
                padding: "9px 12px 9px 34px",
                borderRadius: 9,
                border: "1.5px solid #DDD0C0",
                fontSize: 13,
                fontFamily: "inherit",
                outline: "none",
                color: "#2C1F14",
                background: "#FAF6F1",
                transition: "border-color 0.15s",
              }}
            />
          </div>

          {[
            {
              value: weekFilter,
              setValue: setWeekFilter,
              options: [["all", "All Weeks"], ...weeks.map((week) => [week, week])],
            },
            {
              value: sortBy,
              setValue: setSortBy,
              options: [
                ["brand", "Sort: Brand A-Z"],
                ["week", "Sort: Week"],
                ["entries", "Sort: Most Entries"],
              ],
            },
          ].map((selectConfig, index) => (
            <div key={index} style={{ position: "relative", flexShrink: 0 }}>
              <select
                value={selectConfig.value}
                onChange={(event) => selectConfig.setValue(event.target.value)}
                style={{
                  appearance: "none",
                  padding: "9px 32px 9px 13px",
                  borderRadius: 9,
                  border: "1.5px solid #DDD0C0",
                  fontSize: 13,
                  fontFamily: "inherit",
                  background: "#FAF6F1",
                  color: "#5C4A3A",
                  cursor: "pointer",
                  outline: "none",
                }}
              >
                {selectConfig.options.map(([optionValue, label]) => (
                  <option key={optionValue} value={optionValue}>
                    {label}
                  </option>
                ))}
              </select>
              <span
                style={{
                  position: "absolute",
                  right: 10,
                  top: "50%",
                  transform: "translateY(-50%)",
                  pointerEvents: "none",
                }}
              >
                <Icon name="chevronDown" size={13} color="#B5A898" />
              </span>
            </div>
          ))}

          <div
            style={{
              marginLeft: "auto",
              fontSize: 12,
              color: "#B5A898",
              whiteSpace: "nowrap",
              fontStyle: "italic",
            }}
          >
            {filtered.length} record{filtered.length !== 1 ? "s" : ""}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 0", color: "#C4B5A5" }}>
            <p style={{ fontSize: 15, fontStyle: "italic" }}>No records match your filters.</p>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
              gap: 16,
            }}
          >
            {filtered.map((record, index) => (
              <div key={record.id ?? index} style={{ animationDelay: `${index * 0.03}s` }}>
                <BrandCard
                  record={record}
                  onClick={setSelected}
                  summaryLines={tweaks.summaryLines}
                  showGroupId={tweaks.showGroupId}
                />
              </div>
            ))}
          </div>
        )}
      </main>

      {selected && <SidePanel record={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}

function App() {
  const [tweaks] = useState(TWEAK_DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [data, setData] = useState([]);
  const [config, setConfig] = useState({
    configured: false,
    source: "supabase",
    table: "",
  });

  const loadData = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/brand-summaries");
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error || "Failed to load brand summaries.");
      }

      setData(payload.records || []);
      setConfig(payload.config || {});
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading && data.length === 0) {
    return (
      <div style={{ minHeight: "100vh", display: "grid", placeItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, color: "#7A6252" }}>
          <Icon name="loader" size={18} color={tweaks.accentColor} />
          Loading dashboard...
        </div>
      </div>
    );
  }

  if (error && data.length === 0) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
        <div
          style={{
            width: "100%",
            maxWidth: 560,
            background: "#FFFDF9",
            borderRadius: 18,
            border: "1.5px solid #E8DDD1",
            padding: 28,
            boxShadow: "0 4px 24px rgba(80, 50, 20, 0.08)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10, color: "#8E2F2F", marginBottom: 12 }}>
            <Icon name="warning" size={18} color="#8E2F2F" />
            <strong>Unable to load the dashboard</strong>
          </div>
          <p style={{ color: "#5C4A3A", lineHeight: 1.7 }}>{error}</p>
          <button
            onClick={loadData}
            style={{
              marginTop: 18,
              padding: "10px 14px",
              borderRadius: 10,
              border: "none",
              background: `linear-gradient(135deg, ${tweaks.accentColor}, ${tweaks.accentColor}CC)`,
              color: "#fff",
              fontFamily: "inherit",
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  if (!config.configured && config.source !== "demo" && data.length === 0) {
    return <SetupCard accent={tweaks.accentColor} />;
  }

  return <Dashboard data={data} config={config} tweaks={tweaks} onRefresh={loadData} loading={loading} />;
}

export default App;
