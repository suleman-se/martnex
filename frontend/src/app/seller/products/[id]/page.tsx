import { redirect } from 'next/navigation';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function SellerProductPage({ params }: Props) {
  const { id } = await params;
  redirect(`/seller/products/${id}/edit`);
}
