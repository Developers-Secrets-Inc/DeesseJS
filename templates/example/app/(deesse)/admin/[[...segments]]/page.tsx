import { RootLayout } from "@deessejs/admin";

export default async function Page({
  params,
}: {
  params: Promise<{ segments?: string[] }>;
}) {
  const { segments } = await params;
  return <RootLayout segments={segments || []} />;
}
