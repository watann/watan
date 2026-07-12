import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './globals.css';

export const metadata = {
  title: 'Watan Hama | Portfolio',
  description: 'Watan Hama bilingual portfolio and project showcase.',
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }) {
  return (
    <html lang="ku" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
