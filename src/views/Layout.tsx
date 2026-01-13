import type { FC, PropsWithChildren } from 'hono/jsx';

interface LayoutProps {
  title?: string;
  lang?: string;
}

export const Layout: FC<PropsWithChildren<LayoutProps>> = ({ children, title = 'Datastore', lang = 'en' }) => {
  return (
    <html lang={lang}>
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{title}</title>
        <link rel="stylesheet" href="/dist/styles.css" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
        <script type="module" src="https://cdn.jsdelivr.net/npm/@github/relative-time-element@5/dist/bundle.js"></script>
      </head>
      <body class="min-h-screen bg-surface-950">
        {children}
      </body>
    </html>
  );
};
