import DetalleVehiculo from "@/_Extras/main/detalle-vehiculo/detalle";

export const metadata = {
  title: 'Detalle de importación de vehículo - SOIA',
  description: 'Detalle de importación de vehículo',
};

export default async function Page({ searchParams }) {
  const params = await searchParams;
  return <DetalleVehiculo searchParams={params} />;
}
