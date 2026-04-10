import Script from 'next/script';

export const metadata = {
  title: 'Consultas rápidas de SOIA',
  description: 'Consulta rápida por pedimento, VIN o contenedor específico',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <head>
        <Script
          type="module"
          src="https://unpkg.com/ionicons@7.1.0/dist/ionicons/ionicons.esm.js"
          strategy="lazyOnload"
        />
        <Script
          noModule
          src="https://unpkg.com/ionicons@7.1.0/dist/ionicons/ionicons.js"
          strategy="lazyOnload"
        />
      </head>
      <body style={{ margin: 0, padding: 0, boxSizing: 'border-box' }}>{children}</body>
    </html>
  );
}
