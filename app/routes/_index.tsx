import { Link, Outlet } from "react-router";
import { SiteHeaderUnauthed } from "~/components/site-header-unauthed";
import { getGamesByUserId } from "~/crud/game.server";
import { getUserById } from "~/crud/user.server";
import { useEventStream } from "~/lib/eventstream";
import { getUserId } from "~/lib/session.server";
import { friendsSchema } from "~/routes/sse";
import type { Route } from "./+types/_index";
export function meta({}: Route.MetaArgs) {
  return [
    { title: "Better Websim" },
    { name: "description", content: "Welcome to Better Websim" },
  ];
}

export async function loader({ context, request }: Route.LoaderArgs) {
  const userId = await getUserId(request);
  if (!userId) return null;

  const user = await getUserById(context.db, userId);
  if (!user) return new Response("User not found", { status: 400 });

  const games = await getGamesByUserId(context.db, userId);

  return { user, games };
}

export default function Home({ loaderData }: Route.ComponentProps) {
  const test = useEventStream("/sse", {
    deserialize: (raw) => friendsSchema.parse(JSON.parse(raw)),
    channel: "friends",
    returnLatestOnly: true,
  });

  return (
    <div className="[--header-height:calc(theme(spacing.14))]">
      <SiteHeaderUnauthed />
      {loaderData == null && <Link to="/login">Login</Link>}
      <Outlet />
    </div>
  );
}

export { DefaultErrorBoundary as ErrorBoundary } from "~/components/default-error-boundary";
