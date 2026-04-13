'use server';

import pool from '@/_DB/db';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function obtenerPedimento(id) {
  const [[p]] = await pool.query(
    `SELECT p.*, d.banco AS det_banco, d.numero_operacion AS det_num_op,
            d.importe, d.fecha_hora_pago, d.linea_captura, d.estado_linea_captura
     FROM pedimentos p
     LEFT JOIN pedimentos_detalle d ON d.id_pedimento = p.id
     WHERE p.id = ?`,
    [id]
  );
  if (!p) return null;

  const [movimientos] = await pool.query(
    'SELECT id, situacion, detalle, fecha FROM pedimentos_movimientos WHERE id_pedimento = ? ORDER BY orden ASC, id ASC',
    [id]
  );

  const [vehiculos] = await pool.query(
    `SELECT pf.*
     FROM pedimentos_vehiculo_fraccion pf
     WHERE pf.id_pedimento = ?`,
    [id]
  );

  return { ...p, movimientos, vehiculos };
}

export async function agregarMovimiento(prevState, formData) {
  const idPedimento = formData.get('id_pedimento');
  const situacion   = (formData.get('situacion') || '').trim();
  const detalle     = (formData.get('detalle')   || '').trim();
  const fecha       = (formData.get('fecha')     || '').trim();

  if (!situacion) return { error: 'La descripción del movimiento es obligatoria.' };

  const [[{ maxOrden }]] = await pool.query(
    'SELECT COALESCE(MAX(orden), 0) AS maxOrden FROM pedimentos_movimientos WHERE id_pedimento = ?',
    [idPedimento]
  );

  await pool.query(
    'INSERT INTO pedimentos_movimientos (id_pedimento, situacion, detalle, fecha, orden) VALUES (?,?,?,?,?)',
    [idPedimento, situacion, detalle || null, fecha || null, maxOrden + 1]
  );
  revalidatePath(`/superadmin/pedimentos/${idPedimento}/ver`);
  redirect(`/superadmin/pedimentos/${idPedimento}/ver`);
}

export async function eliminarMovimiento(idMovimiento, idPedimento) {
  await pool.query('DELETE FROM pedimentos_movimientos WHERE id = ?', [idMovimiento]);
  revalidatePath(`/superadmin/pedimentos/${idPedimento}/ver`);
  redirect(`/superadmin/pedimentos/${idPedimento}/ver`);
}

export async function eliminarPedimento(id) {
  const { eliminarPedimento: fn } = await import('../servidor');
  return fn(id);
}
