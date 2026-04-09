'use server';

import pool from '../../../_DB/db.js';
import { redirect } from 'next/navigation';

export async function accionLogin(formData) {
  const usuario   = formData.get('usuario');
  const contrasena = formData.get('contrasena');

  const [rows] = await pool.query(
    'SELECT id FROM usuarios WHERE usuario = ? AND contrasena = ? AND activo = 1',
    [usuario, contrasena]
  );

  if (rows.length === 0) {
    return { error: 'Usuario o contraseña incorrectos' };
  }

  redirect('/superadmin');
}
