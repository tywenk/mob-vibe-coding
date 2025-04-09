import { Outlet, useLoaderData } from "react-router";
import { SidebarLayout } from "~/components/sidebar-layout";
import { getGamesByUserId } from "~/crud/game.server";
import { getUserId } from "~/lib/session.server";
import type { Route } from "./+types/_index";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Better Websim" },
    { name: "description", content: "Welcome to Better Websim" },
  ];
}

export async function loader({ context, request }: Route.LoaderArgs) {
  const userId = await getUserId(request);
  if (!userId) return { games: [] };

  const games = await getGamesByUserId(context.db, userId);
  return { games };
}

export default function Home() {
  const { games } = useLoaderData<typeof loader>();
  return (
    <SidebarLayout games={games}>
      <Outlet />
    </SidebarLayout>
  );
}

export { DefaultErrorBoundary as ErrorBoundary } from "~/components/default-error-boundary";
