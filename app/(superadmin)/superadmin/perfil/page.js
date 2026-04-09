import Perfil from '../../../../_Extras/superadmin/contenido/perfil/perfil';
import { obtenerPerfil } from '../../../../_Extras/superadmin/contenido/perfil/servidor';

export default async function Page({ searchParams }) {
  const sp     = await searchParams;
  const perfil = await obtenerPerfil();
  return <Perfil perfil={perfil} ok={sp?.ok === '1'} />;
}
