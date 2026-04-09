'use server';

import pool from "@/_DB/db";

export async function obtenerRegistros({ pagina = 1, porPagina = 50 } = {}) {
  const offset = (pagina - 1) * porPagina;
  const [[{ total }]] = await pool.query('SELECT COUNT(*) AS total FROM registro_busquedas');
  const [rows] = await pool.query(
    `SELECT id, tipo, aduana_label, anio, patente, documento, vin, contenedor,
            ip, pais, pais_codigo, region, ciudad, isp,
            encontrado, total_resultados, fecha
     FROM registro_busquedas
     ORDER BY fecha DESC
     LIMIT ? OFFSET ?`,
    [porPagina, offset]
  );
  return { rows, total, pagina, porPagina, totalPaginas: Math.ceil(total / porPagina) };
}
