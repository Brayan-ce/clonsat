import Sidebar from '../../_Extras/superadmin/contenido/sidebar/sidebar';
import Topbar from '../../_Extras/superadmin/contenido/topbar/topbar';
import styles from './layout.module.css';

export const dynamic = 'force-dynamic';

export default function SuperAdminLayout({ children }) {
  return (
    <div className={styles.layout}>
      <Sidebar />
      <div className={styles.contentWrap}>
        <Topbar />
        <main className={styles.main}>{children}</main>
      </div>
    </div>
  );
}
