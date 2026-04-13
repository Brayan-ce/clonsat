'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getDatosPedimento } from './servidor';
import styles from './detalle.module.css';

// Imagenes base64 del HTML guardado con SingleFile
// Abre el .html en VS Code y busca/reemplaza estos valores:
// IMG_HEADER    -> id="pnlEncabezado"  valor dentro de background-image:url(...)
// IMG_LINEA     -> id="imgLinea"       valor del atributo src="..."
// IMG_SALIR_BTN -> id="Imagebutton1"   valor del atributo src="..."
const IMG_HEADER    = '/logo2.png';
const IMG_LINEA     = '';
const IMG_SALIR_BTN = '/volver.gif';

export default function DetalleVehiculo({ searchParams }) {
  const router = useRouter();
  const [data, setData] = useState(null);

  useEffect(() => {
    async function cargar() {
      const params = {
        patente:  searchParams?.Patente  ?? '3581',
        numDcto:  searchParams?.NumDcto  ?? '6022541',
        anio:     searchParams?.Anio     ?? '2026',
        docClave: searchParams?.DocClave ?? 'VU',
        vin:      searchParams?.VIN      ?? '1C4GJWAG1JL931083',
        aduana:   searchParams?.Aduana   ?? '400',
      };
      const result = await getDatosPedimento(params);
      setData(result);
    }
    cargar();
  }, []);

  if (!data) return <div className={styles.loading}>Cargando...</div>;

  return (
    <div className={styles.wrapper}>

      {/* Encabezado con logo SAT */}
      <div style={{ position: 'relative', display: 'inline-block' }}>
        <div style={{
          borderColor:     'White',
          fontSize:        'smaller',
          height:          96,
          width:           1010,
          backgroundImage: `url(${IMG_HEADER})`,
          backgroundSize:  'cover',
        }} />
        <span
          className={styles.tituloModulo}
          style={{
            position:   'absolute',
            top:        102,
            left:       0,
            marginLeft: '1%',
          }}
        >
          Detalle de importación de vehículo
        </span>
        <img
          src={IMG_SALIR_BTN}
          title="Volver"
          alt="Volver"
          onClick={() => router.back()}
          style={{
            height:      22,
            width:       22,
            borderWidth: 0,
            cursor:      'pointer',
            position:    'absolute',
            top:         102,
            left:        966,
          }}
        />
      </div>

      {/* Linea verde decorativa */}
      {IMG_LINEA && (
        <img
          src={IMG_LINEA}
          alt=""
          style={{
            borderColor: 'transparent',
            borderWidth:  0,
            height:       7,
            width:        1003,
            display:      'block',
          }}
        />
      )}

      {/* Tabla principal */}
      <table className={styles.tbPrincipal} cellSpacing={0} cellPadding={0} border={0}>
        <tbody>
          <tr><td style={{ width: 25 }} /></tr>
          <tr><td height={15} colSpan={2} /></tr>
          <tr>
            <td style={{ width: 5 }} />
            <td>
              <table cellSpacing={0} cellPadding={0} border={0} style={{ width: 1352 }}>
                <tbody>
                  <tr>
                    <td style={{ width: 40 }} />
                    <td colSpan={5} height={30} />
                  </tr>
                  <tr>
                    <td colSpan={5} height={25}>
                      <table cellSpacing={1} cellPadding={1} border={0}>
                        <tbody>

                          {/* Titulo Datos del Importador */}
                          <tr>
                            <td style={{ width: 10 }} />
                            <td colSpan={2}>
                              <span className={styles.titulo1}>Datos del Importador</span>
                            </td>
                            <td /><td /><td>&nbsp;</td><td />
                          </tr>

                          {/* Nombre / RFC / CURP */}
                          <tr>
                            <td height={25} style={{ width: 10 }} />
                            <td className={styles.style61} height={30}>
                              <span className={styles.etiquetas3CRPE} style={{ width: 180 }}>Nombre/Razón Social:</span>
                            </td>
                            <td className={styles.style28} height={30}>
                              <span className={styles.etiquetas3} style={{ width: 445 }}>{data.importador}</span>
                            </td>
                            <td className={styles.style55} height={30}>
                              <span className={styles.etiquetas3CRPE} style={{ width: 150 }}>RFC:</span>
                            </td>
                            <td className={styles.style62} height={30}>
                              <span className={styles.etiquetas3} style={{ width: 132 }}>{data.rfc}</span>
                            </td>
                            <td className={styles.style71} height={30}>
                              <span className={styles.etiquetas3CRPE} style={{ width: 73 }}>CURP:</span>
                            </td>
                            <td className={styles.style74} height={25}>
                              <span className={styles.etiquetas3} style={{ width: 150 }}>{data.curp}</span>
                            </td>
                          </tr>

                          {/* Direccion / Numero / CP */}
                          <tr>
                            <td height={30} style={{ width: 10 }} />
                            <td className={styles.style53} height={30}>
                              <span className={styles.etiquetas3CRPE} style={{ width: 180 }}>Dirección: Calle</span>
                            </td>
                            <td className={styles.style32} height={30}>
                              <span className={styles.etiquetas3} style={{ width: 443 }}>{data.calle}</span>
                            </td>
                            <td className={styles.style56} height={30}>
                              <span className={styles.etiquetas3CRPE} style={{ width: 150 }}>Número Ext./Int.:</span>
                            </td>
                            <td className={styles.style63} height={30}>
                              <span className={styles.etiquetas3} style={{ width: 132 }}>{data.numExt}</span>
                            </td>
                            <td className={styles.style72} height={30}>
                              <span className={styles.etiquetas3CRPE} style={{ width: 78 }}>C. P.:</span>
                            </td>
                            <td className={styles.style75} height={30}>
                              <span className={styles.etiquetas3} style={{ width: 130 }}>{data.cp}</span>
                            </td>
                          </tr>

                          {/* Municipio / Apartado Postal */}
                          <tr>
                            <td style={{ width: 10 }} />
                            <td className={styles.style54}>
                              <span className={styles.etiquetas3CRPE} style={{ width: 180 }}>Municipio:</span>
                            </td>
                            <td className={styles.style21}>
                              <span className={styles.etiquetas3} style={{ width: 442 }}>{data.municipio}</span>
                            </td>
                            <td className={styles.style43}>
                              <span className={styles.etiquetas3CRPE} style={{ width: 150 }}>Apartado Postal:</span>
                            </td>
                            <td className={styles.style64}>
                              <span className={styles.etiquetas3} style={{ width: 132 }}>{data.aPostal}</span>
                            </td>
                            <td />
                            <td height={30} />
                          </tr>

                          {/* Entidad / Pais */}
                          <tr>
                            <td style={{ width: 10 }} />
                            <td className={styles.style52}>
                              <span className={styles.etiquetas3CRPE} style={{ width: 180 }}>Entidad Federativa:</span>
                            </td>
                            <td className={styles.style20}>
                              <span className={styles.etiquetas3} style={{ width: 440 }}>{data.entidad}</span>
                            </td>
                            <td className={styles.style57}>
                              <span className={styles.etiquetas3CRPE} style={{ width: 150 }}>País:</span>
                            </td>
                            <td colSpan={2}>
                              <span className={styles.etiquetas3} style={{ width: 327 }}>{data.pais}</span>
                            </td>
                            <td height={30} />
                          </tr>

                          {/* Titulo Datos del Pedimento */}
                          <tr>
                            <td style={{ width: 10, height: 10 }} />
                            <td colSpan={2}>
                              <span className={styles.titulo1}>Datos del Pedimento</span>
                            </td>
                            <td /><td /><td /><td />
                          </tr>

                          {/* Aduana / Fecha de pago / Clave Documento */}
                          <tr>
                            <td style={{ width: 10, height: 30 }} />
                            <td>
                              <span className={`${styles.etiquetas3CRPE} ${styles.bold}`} style={{ width: 47 }}>Aduana:</span>
                            </td>
                            <td>
                              <span className={styles.etiquetas3} style={{ width: 441 }}>{data.aduana}</span>
                            </td>
                            <td>
                              <span className={`${styles.etiquetas3CRPE} ${styles.bold}`} style={{ width: 142 }}>Fecha de pago</span>
                            </td>
                            <td className={styles.style66}>
                              <span className={styles.etiquetas3} style={{ width: 181 }}>{data.fechaPago}</span>
                            </td>
                            <td className={styles.style70}>
                              <span className={`${styles.etiquetas3CRPE} ${styles.bold}`} style={{ width: 134 }}>Clave Documento</span>
                            </td>
                            <td className={styles.style73}>
                              <span className={styles.etiquetas3} style={{ width: 129 }}>{data.claveDoc}</span>
                            </td>
                          </tr>

                          {/* Patente / Documento */}
                          <tr>
                            <td style={{ width: 10, height: 30 }} />
                            <td>
                              <span className={`${styles.etiquetas3CRPE} ${styles.bold}`} style={{ width: 50 }}>Patente</span>
                            </td>
                            <td>
                              <span className={styles.etiquetas3} style={{ width: 94 }}>{data.patente}</span>
                            </td>
                            <td>
                              <span className={`${styles.etiquetas3CRPE} ${styles.bold}`} style={{ width: 76 }}> Documento</span>
                            </td>
                            <td className={styles.style66}>
                              <span className={styles.etiquetas3} style={{ width: 125 }}>{data.documento}</span>
                            </td>
                            <td className={styles.style70}>&nbsp;</td>
                            <td className={styles.style73}>&nbsp;</td>
                          </tr>

                          {/* Boton Exportar a Excel */}
                          <tr>
                            <td style={{ width: 10 }} /><td /><td /><td />
                            <td className={styles.style66}>&nbsp;</td>
                            <td colSpan={2} align="center">
                              <button className={styles.btnPrimario}>Exportar a Excel</button>
                            </td>
                          </tr>

                          {/* Total de registros */}
                          <tr>
                            <td style={{ width: 10 }} /><td /><td /><td /><td />
                            <td colSpan={2} align="center">
                              <span className={styles.etiquetas3} style={{ width: 149 }}>
                                Total de registros: {data.vehiculos?.length ?? 0}
                              </span>
                            </td>
                          </tr>

                        </tbody>
                      </table>
                    </td>
                  </tr>

                  {/* Grid de vehiculos */}
                  <tr>
                    <td colSpan={4} height={15}>
                      <table cellSpacing={1} cellPadding={1} border={0}>
                        <tbody>
                          <tr>
                            <td style={{ width: 1, height: 10 }} />
                            <td height={10} />
                            <td height={10} />
                            <td align="right" colSpan={2}>
                              <span className={styles.etiquetaLogin} style={{ color: '#285C4D', display: 'inline-block', width: 637 }}>
                                ---------------- IVA ------------------------ AD-VALOREM ------------------------- ISAN ---------------------- TENENCIA ------------ .
                              </span>
                            </td>
                          </tr>
                          <tr>
                            <td style={{ width: 1 }} />
                            <td colSpan={6}>
                              <table className={styles.grdVehiculos} cellSpacing={0} cellPadding={3} border={0}>
                                <tbody>
                                  <tr className={styles.gridHeader}>
                                    <td style={{ width: 25 }}>FRACCION</td>
                                    <td style={{ width: 25 }}>SECUEN FRACC.</td>
                                    <td style={{ width: 125 }}>MARCA</td>
                                    <td style={{ width: 190 }}>MODELO</td>
                                    <td style={{ width: 20 }}>AÑO</td>
                                    <td style={{ width: 190 }}>NÚMERO DE SERIE</td>
                                    <td style={{ width: 25 }}>KILOMETRAJE</td>
                                    <td style={{ width: 100 }}>VALOR EN ADUANA</td>
                                    <td style={{ width: 120 }}>FORMA DE PAGO</td>
                                    <td style={{ width: 80 }}>IMPORTE</td>
                                    <td style={{ width: 120 }}>FORMA DE PAGO</td>
                                    <td style={{ width: 80 }}>IMPORTE</td>
                                    <td style={{ width: 120 }}>FORMA DE PAGO</td>
                                    <td style={{ width: 80 }}>IMPORTE</td>
                                    <td style={{ width: 120 }}>FORMA DE PAGO</td>
                                    <td style={{ width: 80 }}>IMPORTE</td>
                                  </tr>
                                  {data.vehiculos.map((v, i) => (
                                    <tr key={i} className={styles.gridRow}>
                                      <td className={styles.fraccion}>{v.fraccion}</td>
                                      <td align="center">{v.secuencia}</td>
                                      <td>{v.marca}</td>
                                      <td>{v.modelo}</td>
                                      <td align="left">{v.anio}</td>
                                      <td align="center">{v.serie}</td>
                                      <td>{v.km}</td>
                                      <td align="center">{v.valorAduana}</td>
                                      <td align="center" className={styles.formaPago}>{v.fpIva}</td>
                                      <td align="right">{v.impIva}</td>
                                      <td align="center" className={styles.formaPago}>{v.fpAdValorem}</td>
                                      <td align="right">{v.impAdValorem}</td>
                                      <td align="center" className={styles.formaPago}>{v.fpIsan}</td>
                                      <td align="right">{v.impIsan}</td>
                                      <td align="center" className={styles.formaPago}>{v.fpTenencia}</td>
                                      <td align="right">{v.impTenencia}</td>
                                    </tr>
                                  ))}
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
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}