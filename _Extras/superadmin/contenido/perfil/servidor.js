'use server';

import pool from '../../../../../_DB/db.js';
import { redirect } from 'next/navigation';

export async function obtenerPerfil() {
  const [[u]] = await pool.query(
    'SELECT id, usuario FROM usuarios WHERE activo = 1 LIMIT 1'
  );
  return u || null;
}

export async function actualizarPerfil(formData) {
  const id            = formData.get('id')?.trim()             || '';
  const nuevoUsuario  = formData.get('usuario')?.trim()        || '';
  const contrasenaAct = formData.get('contrasena_actual')?.trim() || '';
  const contrasenaNue = formData.get('contrasena_nueva')?.trim()  || '';
  const contrasenaRep = formData.get('contrasena_repetir')?.trim() || '';

  if (!nuevoUsuario) return { error: 'El nombre de usuario no puede estar vacío.' };

  // Verificar contraseña actual siempre
  const [[u]] = await pool.query(
    'SELECT id FROM usuarios WHERE id = ? AND contrasena = ?',
    [id, contrasenaAct]
  );
  if (!u) return { error: 'La contraseña actual es incorrecta.' };

  // Si quiere cambiar contraseña
  if (contrasenaNue) {
    if (contrasenaNue !== contrasenaRep) return { error: 'Las contraseñas nuevas no coinciden.' };
    if (contrasenaNue.length < 4)       return { error: 'La contraseña nueva debe tener al menos 4 caracteres.' };
    await pool.query(
      'UPDATE usuarios SET usuario = ?, contrasena = ? WHERE id = ?',
      [nuevoUsuario, contrasenaNue, id]
    );
  } else {
    await pool.query(
      'UPDATE usuarios SET usuario = ? WHERE id = ?',
      [nuevoUsuario, id]
    );
  }

  redirect('/superadmin/perfil?ok=1');
}
