'use server';

import pool from '@/_DB/db';

export async function obtenerResumen() {
  const [[{ totalPedimentos }]] = await pool.query('SELECT COUNT(*) AS totalPedimentos FROM pedimentos');
  const [[{ totalUsuarios }]]   = await pool.query('SELECT COUNT(*) AS totalUsuarios FROM usuarios');
  const [ultimosPedimentos]     = await pool.query(
    'SELECT aduana_label, anio, patente, documento, estado, fecha FROM pedimentos ORDER BY id DESC LIMIT 5'
  );
  return { totalPedimentos, totalUsuarios, ultimosPedimentos };
}
