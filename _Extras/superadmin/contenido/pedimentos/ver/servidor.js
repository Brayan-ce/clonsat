'use server';

import pool from '../../../../../_DB/db.js';

export async function obtenerPedimento(id) {
  const [[p]] = await pool.query(
    `SELECT p.*, d.banco AS det_banco, d.numero_operacion AS det_num_op,
            d.importe, d.fecha_hora_pago, d.linea_captura, d.estado_linea_captura
     FROM pedimentos p
     LEFT JOIN pedimentos_detalle d ON d.id_pedimento = p.id
     WHERE p.id = ?`,
    [id]
  );
  return p || null;
}
