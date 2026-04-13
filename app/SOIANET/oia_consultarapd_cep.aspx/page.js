import DetallePedimento from '@/_Extras/main/detalle-pedimento/detalle-pedimento';

export const metadata = {
  title: 'Detalle de situación del pedimento - SOIA',
  description: 'Detalle de situación del pedimento',
};

export default async function Page({ searchParams }) {
  const params = await searchParams;
  return <DetallePedimento searchParams={params} />;
}
