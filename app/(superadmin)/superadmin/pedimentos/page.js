import Pedimentos from '../../../../_Extras/superadmin/contenido/pedimentos/pedimentos';
import { obtenerPedimentos } from '../../../../_Extras/superadmin/contenido/pedimentos/servidor';

export default async function PedimentosPage() {
  const lista = await obtenerPedimentos();
  return <Pedimentos lista={lista} />;
}
