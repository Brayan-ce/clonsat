'use server';

import pool from '@/_DB/db';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

export async function obtenerPedimentos() {
  const [rows] = await pool.query(
    'SELECT id, aduana, aduana_label, anio, patente, documento, estado, fecha FROM pedimentos ORDER BY id DESC'
  );
  return rows;
}

export async function eliminarPedimento(id) {
  try {
    await pool.query('DELETE FROM pedimentos WHERE id = ?', [id]);
  } catch {
    return { error: 'Error al eliminar el pedimento' };
  }
  revalidatePath('/superadmin/pedimentos');
  redirect('/superadmin/pedimentos');
}
