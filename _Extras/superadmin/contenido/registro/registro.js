'use client';

import { useState } from 'react';
import styles from './registro.module.css';

const TIPO_LABEL = { pedimento: 'Pedimento', vin: 'VIN', contenedor: 'Contenedor' };

function badge(tipo) {
  const cls = { pedimento: styles.badgePed, vin: styles.badgeVin, contenedor: styles.badgeCon };
  return <span className={`${styles.badge} ${cls[tipo] ?? ''}`}>{TIPO_LABEL[tipo] ?? tipo}</span>;
}

export default function Registro({ data }) {
  const [pagina, setPagina] = useState(data.pagina);

  const { rows, total, totalPaginas, porPagina } = data;
  const inicio = (pagina - 1) * porPagina + 1;
  const fin    = Math.min(pagina * porPagina, total);

  function irA(p) {
    if (p < 1 || p > totalPaginas) return;
    // recarga la ruta con el query param
    window.location.href = `/superadmin/registro?pagina=${p}`;
  }

  return (
    <div className={styles.page}>
      <div className={styles.encabezado}>
        <h1 className={styles.titulo}>Registro de Búsquedas</h1>
        <span className={styles.contador}>{total.toLocaleString('es-MX')} registros</span>
      </div>

      {rows.length === 0 ? (
        <p className={styles.vacio}>Aún no hay búsquedas registradas.</p>
      ) : (
        <>
          <div className={styles.tableWrap}>
            <table className={styles.tabla}>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Tipo</th>
                  <th>Búsqueda</th>
                  <th>IP</th>
                  <th>País / Región / Ciudad</th>
                  <th>ISP</th>
                  <th>Resultado</th>
                  <th>Fecha</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => {
                  let busqueda = '';
                  if (r.tipo === 'pedimento') busqueda = `${r.aduana_label ?? ''} · ${r.anio} · Pat ${r.patente} · Doc ${r.documento}`;
                  else if (r.tipo === 'vin')  busqueda = `VIN: ${r.vin}`;
                  else                        busqueda = `Cont: ${r.contenedor}`;

                  return (
                    <tr key={r.id} className={r.encontrado ? styles.rowOk : styles.rowNo}>
                      <td className={styles.tdId}>{r.id}</td>
                      <td>{badge(r.tipo)}</td>
                      <td className={styles.tdBusqueda}>{busqueda}</td>
                      <td className={styles.tdIp}>{r.ip}</td>
                      <td className={styles.tdGeo}>
                        {[r.pais, r.region, r.ciudad].filter(Boolean).join(' / ') || '—'}
                      </td>
                      <td className={styles.tdIsp}>{r.isp || '—'}</td>
                      <td className={styles.tdRes}>
                        {r.encontrado
                          ? <span className={styles.found}>✓ {r.total_resultados}</span>
                          : <span className={styles.notFound}>✗ Sin resultado</span>}
                      </td>
                      <td className={styles.tdFecha}>{new Date(r.fecha).toLocaleString('es-MX')}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {totalPaginas > 1 && (
            <div className={styles.paginacion}>
              <span className={styles.rangoInfo}>Mostrando {inicio}–{fin} de {total}</span>
              <div className={styles.btns}>
                <button className={styles.btnPag} disabled={pagina <= 1} onClick={() => irA(pagina - 1)}>← Ant</button>
                <span className={styles.paginaActual}>{pagina} / {totalPaginas}</span>
                <button className={styles.btnPag} disabled={pagina >= totalPaginas} onClick={() => irA(pagina + 1)}>Sig →</button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
