import Crear from '../../../../../_Extras/superadmin/contenido/pedimentos/crear/crear';

export default async function Page({ searchParams }) {
  const sp   = await searchParams;
  const tipo = sp?.tipo ?? null;
  return <Crear tipo={tipo} />;
}
