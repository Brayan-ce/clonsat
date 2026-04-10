import Sidebar from '../../_Extras/superadmin/contenido/sidebar/sidebar';

export const dynamic = 'force-dynamic';

export default function SuperAdminLayout({ children }) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f4f6f8', fontFamily: 'Arial, sans-serif' }}>
      <Sidebar />
      <main style={{ flex: 1, overflow: 'auto', padding: '30px 28px' }}>
        {children}
      </main>
    </div>
  );
}
