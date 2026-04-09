'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import styles from './login.module.css';
import { accionLogin } from './servidor';

export default function Login() {
  const [error, setError]       = useState('');
  const [cargando, setCargando] = useState(false);
  const [recordar, setRecordar] = useState(false);
  const [usuarioGuardado, setUsuarioGuardado] = useState('');

  useEffect(() => {
    const guardado = localStorage.getItem('sa_usuario');
    if (guardado) {
      setUsuarioGuardado(guardado);
      setRecordar(true);
    }
  }, []);

  async function handleSubmit(formData) {
    setError('');
    setCargando(true);
    if (recordar) {
      localStorage.setItem('sa_usuario', formData.get('usuario'));
    } else {
      localStorage.removeItem('sa_usuario');
    }
    const res = await accionLogin(formData);
    if (res?.error) {
      setError(res.error);
    }
    setCargando(false);
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>

        <Image
          src="/logo.png"
          alt="HACIENDA SAT"
          width={480}
          height={70}
          className={styles.logo}
          priority
        />

        <h2 className={styles.titulo}>Acceso al Sistema</h2>

        <form className={styles.form} action={handleSubmit} noValidate>

          <label className={styles.label} htmlFor="usuario">Usuario</label>
          <input
            id="usuario"
            name="usuario"
            type="text"
            className={styles.input}
            defaultValue={usuarioGuardado}
            autoComplete="username"
            maxLength={80}
            required
          />

          <label className={styles.label} htmlFor="contrasena">Contraseña</label>
          <input
            id="contrasena"
            name="contrasena"
            type="password"
            className={styles.input}
            autoComplete="current-password"
            maxLength={255}
            required
          />

          <label className={styles.labelRecordar}>
            <input
              type="checkbox"
              className={styles.checkRecordar}
              checked={recordar}
              onChange={(e) => setRecordar(e.target.checked)}
            />
            Recordar usuario
          </label>

          {error && <div className={styles.error}>{error}</div>}

          <button
            type="submit"
            className={styles.btn}
            disabled={cargando}
          >
            {cargando ? 'Verificando...' : 'Ingresar'}
          </button>

        </form>

      </div>
    </div>
  );
}
