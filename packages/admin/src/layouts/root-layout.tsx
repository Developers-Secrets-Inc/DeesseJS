import { Config } from "deesse";

import { LoginPage } from "../pages/login-page";
import { DashboardLayout } from "./dashboard-layout";

export const RootLayout: React.FC<{ segments: string[]; config: Config }> = ({
  segments,
  config,
}: {
  segments: string[];
  config: Config;
}) => {
  if (segments.includes("login")) {
    return <LoginPage />;
  }

  return <DashboardLayout />;
};
