import Editar from '../../../../../../_Extras/superadmin/contenido/pedimentos/editar/editar';
import { obtenerPedimento } from '../../../../../../_Extras/superadmin/contenido/pedimentos/editar/servidor';

export default async function Page({ params }) {
  const { id } = await params;
  const pedimento = await obtenerPedimento(id);
  return <Editar id={id} pedimento={pedimento} />;
}
