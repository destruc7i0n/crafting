import { Outlet } from "react-router-dom";

import { Layout } from "@/components/layout/layout";
import { useMinecraftTexturesData } from "@/hooks/use-minecraft-textures-data";

export const Root = () => {
  useMinecraftTexturesData();

  return (
    <Layout>
      <Outlet />
    </Layout>
  );
};
