'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './topbar.module.css';

function getTitulo(pathname) {
  if (pathname.startsWith('/superadmin/pedimentos')) return 'Pedimentos';
  if (pathname.startsWith('/superadmin/registro')) return 'Registro';
  if (pathname.startsWith('/superadmin/perfil')) return 'Mi Perfil';
  return 'Dashboard';
}

function getDescripcion(pathname) {
  if (pathname.startsWith('/superadmin/pedimentos')) return 'Gestiona, consulta y administra tus pedimentos.';
  if (pathname.startsWith('/superadmin/registro')) return 'Revisa el historial de registros y actividad.';
  if (pathname.startsWith('/superadmin/perfil')) return 'Actualiza la informacion de tu cuenta.';
  return 'Resumen general del panel administrativo.';
}

export default function Topbar() {
  const pathname = usePathname();
  const titulo = getTitulo(pathname);
  const descripcion = getDescripcion(pathname);

  return (
    <header className={styles.topbar}>
      <div className={styles.titulos}>
        <p className={styles.kicker}>Panel Admin</p>
        <h2 className={styles.titulo}>{titulo}</h2>
        <p className={styles.descripcion}>{descripcion}</p>
      </div>
      <div className={styles.acciones}>
        <Link href="/superadmin/pedimentos/crear" className={styles.btnPrimario}>
          Registrar nuevo pedimento
        </Link>
      </div>
    </header>
  );
}
