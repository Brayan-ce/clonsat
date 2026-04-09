'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import styles from './pedimentos.module.css';
import { obtenerPedimentos } from './servidor';

export default function Pedimentos() {
  const [lista, setLista]       = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    obtenerPedimentos().then((d) => {
      setLista(d);
      setCargando(false);
    });
  }, []);

  if (cargando) return <div className={styles.cargando}>Cargando...</div>;

  return (
    <div className={styles.page}>
      <div className={styles.encabezado}>
        <h1 className={styles.titulo}>Pedimentos</h1>
        <Link href="/superadmin/pedimentos/crear" className={styles.btnNuevo}>
          + Nuevo Pedimento
        </Link>
      </div>

      <div className={styles.tablaWrap}>
        <table className={styles.tabla}>
          <thead>
            <tr className={styles.tablaHead}>
              <td>ID</td>
              <td>ADUANA</td>
              <td>AÑO</td>
              <td>PATENTE</td>
              <td>DOCUMENTO</td>
              <td>ESTADO</td>
              <td>FECHA</td>
              <td>ACCIONES</td>
            </tr>
          </thead>
          <tbody>
            {lista.length === 0 && (
              <tr><td colSpan={8} className={styles.vacio}>No hay pedimentos registrados</td></tr>
            )}
            {lista.map((p) => (
              <tr key={p.id} className={styles.tablaRow}>
                <td>{p.id}</td>
                <td>{p.aduana_label}</td>
                <td>{p.anio}</td>
                <td>{p.patente}</td>
                <td>{p.documento}</td>
                <td>{p.estado}</td>
                <td>{p.fecha}</td>
                <td className={styles.acciones}>
                  <Link href={`/superadmin/pedimentos/${p.id}/ver`}    className={styles.btnVer}>Ver</Link>
                  <Link href={`/superadmin/pedimentos/${p.id}/editar`} className={styles.btnEditar}>Editar</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
