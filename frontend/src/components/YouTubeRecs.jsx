import React from "react";

export default function YouTubeRecs({ videos = [] }) {
  if (!videos.length) return null;

  return (
    <section style={{ marginTop: "20px" }}>
      <h3>Recommended Videos</h3>

      <div
        style={{
          display: "flex",
          gap: "20px",
          overflowX: "auto",
          paddingBottom: "10px"
        }}
      >
        {videos.map((v, idx) => (
          <a
            key={idx}
            href={`https://www.youtube.com/watch?v=${v.videoId}`}
            target="_blank"
            rel="noreferrer"
            style={{ minWidth: "320px", textDecoration: "none" }}
          >
            <div style={{ borderRadius: "14px", overflow: "hidden", background: "#000" }}>
              <img
                src={v.thumbnail}
                alt={v.title}
                style={{ width: "100%", height: "180px", objectFit: "cover" }}
              />
            </div>

            <p style={{ fontWeight: 600, color: "#0f172a", marginTop: "8px" }}>
              {v.title}
            </p>

            <p style={{ fontSize: "12px", color: "#475569" }}>
              {v.channel}
            </p>

            <p style={{ fontSize: "12px", color: "#64748b" }}>
              {v.views} • {v.published}
            </p>
          </a>
        ))}
      </div>
    </section>
  );
}
