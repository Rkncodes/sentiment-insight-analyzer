import React from "react";

export default function YouTubeRecs({ videos = [] }) {
  if (!videos.length) return null;

  return (
    <section className="app-youtube-section">
      <h3 className="app-youtube-title">Helpful resources for this emotional state</h3>

      <div className="app-youtube-list">
        {videos.map((v, idx) => (
          <a
            key={idx}
            href={`https://www.youtube.com/watch?v=${v.videoId}`}
            target="_blank"
            rel="noreferrer"
            className="app-youtube-card"
          >
            <div className="app-youtube-thumb-wrap">
              <img
                src={v.thumbnail}
                alt={v.title}
                className="app-youtube-thumb"
              />
            </div>

            <p className="app-youtube-video-title">
              {v.title}
            </p>

            <p className="app-youtube-channel">
              {v.channel}
            </p>

            <p className="app-youtube-meta">
              {v.views} • {v.published}
            </p>
          </a>
        ))}
      </div>
    </section>
  );
}
