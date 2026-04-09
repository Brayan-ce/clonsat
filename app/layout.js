export const metadata = {
  title: 'Consultas rápidas de SOIA',
  description: 'Consulta rápida por pedimento, VIN o contenedor específico',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body style={{ margin: 0, padding: 0, boxSizing: 'border-box' }}>{children}</body>
    </html>
  );
}
