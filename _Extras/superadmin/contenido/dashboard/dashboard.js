'use client';

import { useEffect, useState } from 'react';
import styles from './dashboard.module.css';
import { obtenerResumen } from './servidor';

export default function Dashboard() {
  const [datos, setDatos]       = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    obtenerResumen().then((d) => {
      setDatos(d);
      setCargando(false);
    });
  }, []);

  if (cargando) return <div className={styles.cargando}>Cargando...</div>;

  return (
    <div className={styles.page}>
      <h1 className={styles.titulo}>Dashboard</h1>

        <div className={styles.tarjetasRow}>
          <div className={styles.tarjeta}>
            <span className={styles.tarjetaNum}>{datos.totalPedimentos}</span>
            <span className={styles.tarjetaLabel}>Pedimentos registrados</span>
          </div>
          <div className={styles.tarjeta}>
            <span className={styles.tarjetaNum}>{datos.totalUsuarios}</span>
            <span className={styles.tarjetaLabel}>Usuarios activos</span>
          </div>
        </div>

        <section className={styles.seccion}>
          <h2 className={styles.seccionTitulo}>Últimos pedimentos</h2>
          <table className={styles.tabla}>
            <thead>
              <tr className={styles.tablaHead}>
                <td>ADUANA</td>
                <td>AÑO</td>
                <td>PATENTE</td>
                <td>DOCUMENTO</td>
                <td>ESTADO</td>
                <td>FECHA</td>
              </tr>
            </thead>
            <tbody>
              {datos.ultimosPedimentos.map((p, i) => (
                <tr key={i} className={styles.tablaRow}>
                  <td>{p.aduana_label}</td>
                  <td>{p.anio}</td>
                  <td>{p.patente}</td>
                  <td>{p.documento}</td>
                  <td>{p.estado}</td>
                  <td>{p.fecha}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
    </div>
  );
}
