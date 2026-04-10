export const dynamic = 'force-dynamic';

export default function LoginLayout({ children }) {
  return (
    <div style={{ margin: 0, padding: 0, minHeight: '100vh', background: 'linear-gradient(145deg,#1a3d2a,#285c4d,#1a3d2a)' }}>
      {children}
    </div>
  );
}
