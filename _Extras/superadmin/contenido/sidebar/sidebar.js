'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import styles from './sidebar.module.css';

const LINKS = [
  { href: '/superadmin',            label: 'Dashboard' },
  { href: '/superadmin/pedimentos', label: 'Pedimentos' },
  { href: '/superadmin/registro',   label: 'Registro' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router   = useRouter();

  function isActive(href) {
    if (href === '/superadmin') return pathname === '/superadmin';
    return pathname.startsWith(href);
  }

  return (
    <aside className={styles.sidebar}>
      <div className={styles.brand}>Panel Admin</div>
      <nav className={styles.nav}>
        {LINKS.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className={isActive(l.href) ? `${styles.link} ${styles.active}` : styles.link}
          >
            {l.label}
          </Link>
        ))}
      </nav>
      <div className={styles.bottom}>
        <Link
          href="/superadmin/perfil"
          className={isActive('/superadmin/perfil') ? `${styles.link} ${styles.active}` : styles.link}
        >
          Mi Perfil
        </Link>
        <button
          className={styles.btnSalir}
          type="button"
          onClick={() => router.push('/loginsuperadmin')}
        >
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}
