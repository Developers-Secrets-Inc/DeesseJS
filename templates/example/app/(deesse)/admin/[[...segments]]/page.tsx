import { RootLayout } from "@deessejs/admin";
import config from "@deesse-config";

export default async function Page({
  params,
}: {
  params: Promise<{ segments?: string[] }>;
}) {
  const { segments } = await params;
  return <RootLayout segments={segments || []} config={config} />;
}
