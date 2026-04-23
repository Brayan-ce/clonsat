'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import styles from './sidebar.module.css';

const LINKS = [
  { href: '/superadmin',            label: 'Dashboard',   icon: 'grid-outline' },
  { href: '/superadmin/pedimentos', label: 'Pedimentos',  icon: 'document-text-outline' },
  { href: '/superadmin/registro',   label: 'Registro',    icon: 'person-add-outline' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router   = useRouter();
  const [open, setOpen] = useState(false);

  useEffect(() => { setOpen(false); }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  function isActive(href) {
    if (href === '/superadmin') return pathname === '/superadmin';
    return pathname.startsWith(href);
  }

  return (
    <>
      <aside className={styles.sidebar}>
        <div className={styles.brand}>
          <ion-icon name="shield-checkmark-outline" class={styles.brandIcon} />
          <span>Panel Admin</span>
        </div>

        <nav className={styles.nav}>
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={isActive(l.href) ? `${styles.link} ${styles.active}` : styles.link}
            >
              <ion-icon name={l.icon} class={styles.icon} />
              <span>{l.label}</span>
            </Link>
          ))}
        </nav>

        <div className={styles.bottom}>
          <Link
            href="/superadmin/perfil"
            className={isActive('/superadmin/perfil') ? `${styles.link} ${styles.active}` : styles.link}
          >
            <ion-icon name="person-circle-outline" class={styles.icon} />
            <span>Mi Perfil</span>
          </Link>
          <button
            className={styles.btnSalir}
            type="button"
            onClick={() => router.push('/loginsuperadmin')}
          >
            <ion-icon name="log-out-outline" class={styles.icon} />
            <span>Cerrar sesión</span>
          </button>
        </div>
      </aside>

      <div className={styles.mobileBar}>
        <div className={styles.mobileBrand}>
          <ion-icon name="shield-checkmark-outline" class={styles.brandIcon} />
          <span>Panel Admin</span>
        </div>
        <button
          className={styles.hamburger}
          type="button"
          aria-label="Abrir menú"
          onClick={() => setOpen(v => !v)}
        >
          <ion-icon name={open ? 'close-outline' : 'menu-outline'} />
        </button>
      </div>

      {open && <div className={styles.overlay} onClick={() => setOpen(false)} />}

      <div className={`${styles.drawer} ${open ? styles.drawerOpen : ''}`}>
        <div className={styles.drawerHeader}>
          <ion-icon name="shield-checkmark-outline" class={styles.brandIcon} />
          <span>Panel Admin</span>
        </div>

        <nav className={styles.drawerNav}>
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={isActive(l.href) ? `${styles.drawerLink} ${styles.drawerActive}` : styles.drawerLink}
            >
              <ion-icon name={l.icon} class={styles.icon} />
              <span>{l.label}</span>
            </Link>
          ))}
        </nav>

        <div className={styles.drawerBottom}>
          <Link
            href="/superadmin/perfil"
            className={isActive('/superadmin/perfil') ? `${styles.drawerLink} ${styles.drawerActive}` : styles.drawerLink}
          >
            <ion-icon name="person-circle-outline" class={styles.icon} />
            <span>Mi Perfil</span>
          </Link>
          <button
            className={styles.btnSalir}
            type="button"
            onClick={() => router.push('/loginsuperadmin')}
          >
            <ion-icon name="log-out-outline" class={styles.icon} />
            <span>Cerrar sesión</span>
          </button>
        </div>
      </div>
    </>
  );
}