'use server';

import pool from '@/_DB/db';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

/** Devuelve la lista completa de pedimentos */
export async function obtenerPedimentos() {
  const [rows] = await pool.query(
    `SELECT id, aduana, aduana_label, anio, patente, documento,
            estado, fecha, tipo_operacion, clave_documento, vin, contenedor
     FROM pedimentos
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
