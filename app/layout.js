export const metadata = {
  title: 'Sistema de Operación Integral Aduanera',
  description: 'Consulta rápida por pedimento, VIN o contenedor específico',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body style={{ margin: 0, padding: 0, boxSizing: 'border-box' }}>{children}</body>
    </html>
  );
}
