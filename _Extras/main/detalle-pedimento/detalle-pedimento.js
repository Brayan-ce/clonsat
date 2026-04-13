'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getDatosSituacion } from './servidor';
import styles from './detalle-pedimento.module.css';

const IMG_HEADER    = '/logo2.png';
const IMG_SALIR_BTN = '/volver.gif';

export default function DetallePedimento({ searchParams }) {
  const router = useRouter();
  const [data, setData] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    async function cargar() {
      const params = {
        patente: searchParams?.pa  ?? '',
        numDcto: searchParams?.dn  ?? '',
        anio:    searchParams?.ap  ?? '2026',
      };
      const result = await getDatosSituacion(params);
      setData(result);
      setCargando(false);
    }
    cargar();
  }, []);

  if (cargando) return <div className={styles.loading}>Cargando...</div>;
  if (!data) return <div className={styles.loading}>No se encontró información para este pedimento.</div>;

  return (
    <div className={styles.wrapper}>

      {/* Encabezado con logo SAT */}
      <div style={{ position: 'relative', display: 'inline-block' }}>
        <div style={{
          height:          96,
          width:           1010,
          backgroundImage: `url(${IMG_HEADER})`,
          backgroundSize:  'cover',
        }} />
        <span
          className={styles.tituloModulo}
          style={{ position: 'absolute', top: 102, left: 0, marginLeft: '1%' }}
        >
          Detalle de situación del pedimento
        </span>
        <img
          src={IMG_SALIR_BTN}
          title="Salir"
          alt="Salir"
          onClick={() => router.back()}
          style={{
            position:    'absolute',
            top:         102,
            left:        966,
            height:      22,
            width:       22,
            borderWidth: 0,
            cursor:      'pointer',
          }}
        />
      </div>

      {/* Tabla principal */}
      <table className={styles.tbPrincipal} cellSpacing={0} cellPadding={0} border={0}>
        <tbody>
          <tr><td style={{ width: 25 }} /></tr>
          <tr><td height={15} colSpan={2} /></tr>
          <tr>
            <td style={{ width: 5 }} />
            <td>
              <table cellSpacing={0} cellPadding={0} border={0} style={{ width: '100%' }}>
                <tbody>
                  <tr>
                    <td style={{ width: 40 }} />
                    <td colSpan={6} height={20} />
                  </tr>
                  <tr>
                    <td colSpan={7}>
                      <table cellSpacing={1} cellPadding={1} border={0}>
                        <tbody>

                          {/* Fila 1: Aduana | Tipo operación */}
                          <tr>
                            <td style={{ width: 10, height: 30 }} />
                            <td style={{ width: 112 }}>
                              <span className={styles.etiquetas3CRPE}>Aduana:</span>
                            </td>
                            <td style={{ width: 340 }}>
                              <span className={styles.etiquetas3}>
                                {data.aduana}{data.aduanaLabel ? ` ${data.aduanaLabel}` : ''}
                              </span>
                            </td>
                            <td style={{ width: 157 }}>
                              <span className={styles.etiquetas3CRPE}>Tipo operación:</span>
                            </td>
                            <td style={{ width: 226 }} colSpan={3}>
                              <span className={styles.etiquetas3}>{data.tipoOperacion}</span>
                            </td>
                          </tr>

                          {/* Fila 2: Banco | Clave documento */}
                          <tr>
                            <td style={{ width: 10, height: 30 }} />
                            <td>
                              <span className={styles.etiquetas3CRPE}>Banco:</span>
                            </td>
                            <td>
                              <span className={styles.etiquetas3}>{data.banco || '\u00a0'}</span>
                            </td>
                            <td>
                              <span className={styles.etiquetas3CRPE}>Clave documento:</span>
                            </td>
                            <td colSpan={3}>
                              <span className={styles.etiquetas3}>{data.claveDocumento}</span>
                            </td>
                          </tr>

                          {/* Fila 3: Patente | Número operación */}
                          <tr>
                            <td style={{ width: 10, height: 30 }} />
                            <td>
                              <span className={styles.etiquetas3CRPE}>Patente:</span>
                            </td>
                            <td>
                              <span className={styles.etiquetas3}>{data.patente}</span>
                            </td>
                            <td>
                              <span className={styles.etiquetas3CRPE}>Número operación:</span>
                            </td>
                            <td colSpan={3}>
                              <span className={styles.etiquetas3}>{data.numeroOperacion}</span>
                            </td>
                          </tr>

                          {/* Fila 4: Documento | Secuencia | Factura */}
                          <tr>
                            <td style={{ width: 10, height: 30 }} />
                            <td>
                              <span className={styles.etiquetas3CRPE}>Documento:</span>
                            </td>
                            <td style={{ width: 340 }}>
                              <span className={styles.etiquetas3}>{data.documento}</span>
                            </td>
                            <td>
                              <span className={styles.etiquetas3CRPE}>Secuencia:</span>
                            </td>
                            <td style={{ width: 200 }}>
                              <span className={styles.etiquetas3}>{data.secuencia}</span>
                            </td>
                            <td style={{ width: 56 }}>
                              <span className={styles.etiquetas3CRPE}>Factura:</span>
                            </td>
                            <td style={{ width: 78 }}>
                              <span className={styles.etiquetas3}>{data.factura || '0'}</span>
                            </td>
                          </tr>

                        </tbody>
                      </table>
                    </td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>
        </tbody>
      </table>

      {/* ── Sección movimientos — contenedor 903px igual al original ── */}
      <table
        cellSpacing={0}
        cellPadding={0}
        border={0}
        style={{ marginBottom: 0, width: 903, marginLeft: 32, marginTop: 70 }}
      >
        <tbody>
          <tr>
            <td>
              <span
                className={styles.titulo1}
                style={{ display: 'inline-block', borderWidth: 1, borderStyle: 'none', fontWeight: 'normal', height: 21, width: '79%' }}
              >
                Movimientos del Pedimento
              </span>
              <span
                className={styles.etiquetas3CRPE}
                style={{ display: 'inline-block', borderWidth: 1, borderStyle: 'none', fontWeight: 'normal', height: 21, width: 183 }}
              >
                Total de movimientos: {data.movimientos.length}
              </span>

              <table
                className={styles.grdMovimientos}
                cellSpacing={0}
                cellPadding={3}
                border={0}
              >
                <tbody>
                  <tr
                    align="center"
                    valign="middle"
                    className={styles.gridHeader}
                  >
                    <td align="center" style={{ width: 600 }}>SITUACION</td>
                    <td style={{ width: 600 }}>DETALLE</td>
                    <td style={{ width: 350 }}>FECHA</td>
                  </tr>
                  {data.movimientos.map((m, i) => (
                    <tr
                      key={i}
                      style={{
                        color:           'threeddarkshadow',
                        backgroundColor: i % 2 === 0 ? '#F7F7F7' : '#ffffff',
                        fontFamily:      'Arial',
                        fontSize:        '9pt',
                        height:          25,
                      }}
                    >
                      <td className={styles.gridLink} style={{ color: 'threeddarkshadow' }}>
                        {m.situacion === 'PAGADO'
                          ? <span style={{ color: 'blue' }}>{m.situacion}</span>
                          : m.situacion
                        }
                      </td>
                      <td>{m.detalle || '\u00a0'}</td>
                      <td>{m.fecha}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
