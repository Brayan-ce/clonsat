'use server';

import pool from "@/_DB/db";

export async function obtenerRegistros({ pagina = 1, porPagina = 25 } = {}) {
  const offset = (pagina - 1) * porPagina;

  // Total de visitantes distintos (visitor_id o ip como fallback)
  const [[{ total }]] = await pool.query(
    `SELECT COUNT(DISTINCT COALESCE(visitor_id, ip)) AS total FROM registro_busquedas`
  );

  // Visitors paginados con resumen
  const [visitors] = await pool.query(
    `SELECT
       COALESCE(visitor_id, ip)    AS vid,
       MAX(visitor_id)             AS visitor_id,
       MAX(ip)                     AS ip,
       MAX(pais)                   AS pais,
       MAX(pais_codigo)            AS pais_codigo,
       MAX(region)                 AS region,
       MAX(ciudad)                 AS ciudad,
       MAX(isp)                    AS isp,
       COUNT(*)                    AS total_busquedas,
       SUM(encontrado)             AS encontrados,
       MIN(fecha)                  AS primera_visita,
       MAX(fecha)                  AS ultima_visita
     FROM registro_busquedas
     GROUP BY COALESCE(visitor_id, ip)
     ORDER BY ultima_visita DESC
     LIMIT ? OFFSET ?`,
    [porPagina, offset]
  );

  if (visitors.length === 0) {
    return { visitors: [], total, pagina, porPagina, totalPaginas: Math.ceil(total / porPagina) };
  }

  // Busquedas de todos los visitors de esta página en una sola query
  const vids = visitors.map((v) => v.vid);
  const [busquedas] = await pool.query(
    `SELECT id, visitor_id, ip, tipo,
            aduana_label, anio, patente, documento, vin, contenedor,
            pais, ciudad, isp, encontrado, total_resultados, fecha
     FROM registro_busquedas
     WHERE COALESCE(visitor_id, ip) IN (?)
     ORDER BY fecha DESC`,
    [vids]
  );

  // Agrupar búsquedas por visitor (orden DESC ya viene, invertir para primero=más antiguo)
  const map = {};
  for (const b of busquedas) {
    const key = b.visitor_id || b.ip;
    if (!map[key]) map[key] = [];
    map[key].push(b);
  }

  const result = visitors.map((v) => {
    const lista = map[v.vid] || [];
    // primera búsqueda = la más antigua (última en el array DESC)
    const primera = lista[lista.length - 1] ?? null;
    let primero = '';
    if (primera) {
      if (primera.tipo === 'vin')        primero = primera.vin        || '';
      else if (primera.tipo === 'contenedor') primero = primera.contenedor || '';
      else primero = [primera.anio, primera.patente, primera.documento].filter(Boolean).join(' · ');
    }
    return { ...v, busquedas: lista, primero };
  });

  return {
    visitors: result,
    total,
    pagina,
    porPagina,
    totalPaginas: Math.ceil(total / porPagina),
  };
}
