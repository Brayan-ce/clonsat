import Ver from '../../../../../../_Extras/superadmin/contenido/pedimentos/ver/ver';
import { obtenerPedimento } from '../../../../../../_Extras/superadmin/contenido/pedimentos/ver/servidor';

export default async function Page({ params }) {
  const { id } = await params;
  const pedimento = await obtenerPedimento(id);
  return <Ver id={id} pedimento={pedimento} />;
}
