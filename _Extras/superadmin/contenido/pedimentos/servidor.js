'use server';

import pool from '../../../../_DB/db.js';

export async function obtenerPedimentos() {
  const [rows] = await pool.query(
    'SELECT id, aduana, aduana_label, anio, patente, documento, estado, fecha FROM pedimentos ORDER BY id DESC'
  );
  return rows;
}
