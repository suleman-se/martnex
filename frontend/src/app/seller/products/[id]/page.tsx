'use client';

import { redirect } from 'next/navigation';
import { useParams } from 'next/navigation';

export default function SellerProductPage() {
  const params = useParams<{ id: string }>();
  redirect(`/seller/products/${params.id}/edit`);
}
