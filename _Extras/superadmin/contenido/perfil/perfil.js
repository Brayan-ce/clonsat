'use client';

import { useState } from 'react';
import styles from './perfil.module.css';
import { actualizarPerfil } from './servidor';

export default function Perfil({ perfil, ok }) {
  const [enviando, setEnviando] = useState(false);
  const [error, setError]       = useState('');

  if (!perfil) return <div className={styles.page}>No se encontró el perfil.</div>;

  async function handleSubmit(formData) {
    setEnviando(true);
    setError('');
    const res = await actualizarPerfil(formData);
    if (res?.error) {
      setError(res.error);
      setEnviando(false);
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.encabezado}>
        <h1 className={styles.titulo}>Mi Perfil</h1>
      </div>

      {ok && (
        <div className={styles.success}>Los datos se actualizaron correctamente.</div>
      )}

      <form className={styles.form} action={handleSubmit}>
        <input type="hidden" name="id" value={perfil.id} />

        {error && <div className={styles.error}>{error}</div>}

        <div className={styles.campo}>
          <label className={styles.label}>Nombre de usuario</label>
          <input
            name="usuario"
            type="text"
            className={styles.input}
            defaultValue={perfil.usuario}
            maxLength={80}
            required
          />
        </div>

        <hr className={styles.divider} />
        <p className={styles.nota}>
          Para cambiar la contraseña completa los tres campos. Si no deseas cambiarla, déjalos vacíos.
        </p>

        <div className={styles.campo}>
          <label className={styles.label}>Contraseña actual <span className={styles.req}>*</span></label>
          <input name="contrasena_actual" type="password" className={styles.input} maxLength={255} required />
        </div>

        <div className={styles.campo}>
          <label className={styles.label}>Contraseña nueva</label>
          <input name="contrasena_nueva" type="password" className={styles.input} maxLength={255} />
        </div>

        <div className={styles.campo}>
          <label className={styles.label}>Repetir contraseña nueva</label>
          <input name="contrasena_repetir" type="password" className={styles.input} maxLength={255} />
        </div>

        <div className={styles.botones}>
          <button type="submit" className={styles.btnGuardar} disabled={enviando}>
            {enviando ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </div>
      </form>
    </div>
  );
}
