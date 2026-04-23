'use server';

import pool from '@/_DB/db';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

/** Devuelve la lista completa de pedimentos */
export async function obtenerPedimentos() {
  const [rows] = await pool.query(
    `SELECT p.id, p.aduana, p.aduana_label, p.anio, p.patente, p.documento,
            p.estado, p.fecha, p.tipo_operacion, p.clave_documento, p.vin, p.contenedor,
            p.tipo_registro,
            (p.tipo_registro = 'qr') AS es_qr
     FROM pedimentos p
     ORDER BY id DESC`
  );
  return rows;
}

/** Elimina un pedimento (en cascada borra detalle, movimientos, etc.) */
export async function eliminarPedimento(id) {
  try {
    await pool.query('DELETE FROM pedimentos WHERE id = ?', [id]);
  } catch {
    return { error: 'No se pudo eliminar el pedimento' };
  }
  revalidatePath('/superadmin/pedimentos');
  redirect('/superadmin/pedimentos');
}
