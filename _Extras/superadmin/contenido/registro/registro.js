'use client';

import { useState } from 'react';
import styles from './registro.module.css';

const TIPO_LABEL = { pedimento: 'Pedimento', vin: 'VIN', contenedor: 'Contenedor' };

function BadgeTipo({ tipo }) {
  const cls = { pedimento: styles.badgePed, vin: styles.badgeVin, contenedor: styles.badgeCon };
  return <span className={`${styles.badge} ${cls[tipo] ?? ''}`}>{TIPO_LABEL[tipo] ?? tipo}</span>;
}

function VisitorCard({ visitor }) {
  const [abierto, setAbierto] = useState(false);
  const esAnon = !visitor.visitor_id;

  return (
    <div className={styles.card}>
      <button
        type="button"
        className={styles.cardHeader}
        onClick={() => setAbierto((v) => !v)}
        aria-expanded={abierto}
      >
        <div className={styles.cardIzq}>
          <div className={styles.cardTitulo}>
            {visitor.primero && <span className={styles.cardPrimero}>{visitor.primero}</span>}
            <span className={styles.cardIp}>{visitor.ip}</span>
          </div>
          {visitor.pais_codigo && (
            <span className={styles.cardGeo}>
              {visitor.ciudad ? `${visitor.ciudad}, ` : ''}{visitor.pais}
            </span>
          )}
          {visitor.isp && <span className={styles.cardIsp}>{visitor.isp}</span>}
        </div>
        <div className={styles.cardDer}>
          {esAnon && <span className={styles.badgeAnon}>sin cookie</span>}
          <span className={styles.cardStat}>
            <strong>{visitor.total_busquedas}</strong> búsquedas
            &nbsp;·&nbsp;
            <span className={styles.encontradas}>{visitor.encontrados} ✓</span>
            &nbsp;·&nbsp;
            <span className={styles.noEncontradas}>{visitor.total_busquedas - visitor.encontrados} ✗</span>
          </span>
          <span className={styles.cardFecha}>
            {new Date(visitor.ultima_visita).toLocaleString('es-MX')}
          </span>
          <span className={styles.chevron}>{abierto ? '▲' : '▼'}</span>
        </div>
      </button>

      {abierto && (
        <div className={styles.cardBody}>
          {visitor.busquedas.length === 0 ? (
            <p className={styles.vacio}>Sin búsquedas.</p>
          ) : (
            <table className={styles.tabla}>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Tipo</th>
                  <th>Búsqueda</th>
                  <th>Resultado</th>
                  <th>Fecha</th>
                </tr>
              </thead>
              <tbody>
                {visitor.busquedas.map((r) => {
                  let busqueda = '';
                  if (r.tipo === 'pedimento') busqueda = `${r.aduana_label ?? ''} · ${r.anio} · Pat ${r.patente} · Doc ${r.documento}`;
                  else if (r.tipo === 'vin')  busqueda = `VIN: ${r.vin}`;
                  else                        busqueda = `Cont: ${r.contenedor}`;

                  return (
                    <tr key={r.id} className={r.encontrado ? styles.rowOk : styles.rowNo}>
                      <td className={styles.tdId}>{r.id}</td>
                      <td><BadgeTipo tipo={r.tipo} /></td>
                      <td className={styles.tdBusqueda}>{busqueda}</td>
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
          )}
        </div>
      )}
    </div>
  );
}

export default function Registro({ data }) {
  const [pagina, setPagina] = useState(data.pagina);

  const { visitors, total, totalPaginas, porPagina } = data;
  const inicio = (pagina - 1) * porPagina + 1;
  const fin    = Math.min(pagina * porPagina, total);

  function irA(p) {
    if (p < 1 || p > totalPaginas) return;
    window.location.href = `/superadmin/registro?pagina=${p}`;
  }

  return (
    <div className={styles.page}>
      <div className={styles.encabezado}>
        <h1 className={styles.titulo}>Registro de Búsquedas</h1>
        <span className={styles.contador}>{total.toLocaleString('es-MX')} visitantes</span>
      </div>

      {visitors.length === 0 ? (
        <p className={styles.vacio}>Aún no hay búsquedas registradas.</p>
      ) : (
        <>
          <div className={styles.lista}>
            {visitors.map((v) => (
              <VisitorCard key={v.vid} visitor={v} />
            ))}
          </div>

          {totalPaginas > 1 && (
            <div className={styles.paginacion}>
              <span className={styles.rangoInfo}>Mostrando {inicio}–{fin} de {total} visitantes</span>
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
