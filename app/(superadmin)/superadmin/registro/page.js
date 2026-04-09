import Registro from '../../../../_Extras/superadmin/contenido/registro/registro';
import { obtenerRegistros } from '../../../../_Extras/superadmin/contenido/registro/servidor';

export default async function Page({ searchParams }) {
  const sp     = await searchParams;
  const pagina = Math.max(1, parseInt(sp?.pagina ?? '1', 10));
  const data   = await obtenerRegistros({ pagina });
  return <Registro data={data} />;
}
