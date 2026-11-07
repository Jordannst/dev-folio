import type { Metadata } from "next";

export const metadata: Metadata = { title: "Not found" };

// Shown for unmatched URLs across every design, so it carries its own theme and minimal styles.
export default function GlobalNotFound() {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: `(function(){var theme;try{theme=localStorage.getItem('portfolio-theme')}catch{}document.documentElement.dataset.theme=theme==='dark'||theme==='light'?theme:'dark'})()` }} />
        <style>{`html{background:#0a0a0a;color:#fafafa;color-scheme:dark}html[data-theme=light]{background:#fcfcfc;color:#0a0a0a;color-scheme:light}body{margin:0;min-height:100vh;display:grid;place-content:center;gap:12px;text-align:center;font-family:system-ui,sans-serif}h1{margin:0;font-size:20px;font-weight:600}a{color:inherit;font-size:14px}`}</style>
      </head>
      <body>
        <h1>Page not found</h1>
        <a href="/">Back home</a>
      </body>
    </html>
  );
}
