import { Outlet, redirect } from "react-router";
import { CommentsSidebar } from "~/components/comments-sidebar";
import { SidebarLayout } from "~/components/sidebar-layout";
import { SidebarInset } from "~/components/ui/sidebar";
import { getCommentsByGameId } from "~/crud/comment.server";
import { incrementGamePlayCount } from "~/crud/game.server";
import { useUser } from "~/hooks/loaders";
import { getUserId } from "~/lib/session.server";
import type { Route } from "./+types/game.$id";

export async function loader({ context, request, params }: Route.LoaderArgs) {
  const userId = await getUserId(request);
  const gameId = Number(params.id);
  if (isNaN(gameId)) return redirect("/");

  const game = await incrementGamePlayCount(context.db, gameId);
  if (!game) return redirect("/");

  const comments = await getCommentsByGameId(context.db, gameId);
  return { game, comments, isOwner: game.creator_id === userId };
}

export default function Game({ loaderData }: Route.ComponentProps) {
  const user = useUser();
  const { game, comments, isOwner } = loaderData;
  return (
    <SidebarLayout>
      {user ? (
        <CommentsSidebar
          comments={comments ?? []}
          game={game}
          isOwner={isOwner}
        />
      ) : null}
      <SidebarInset className="p-4">
        <Outlet />
      </SidebarInset>
    </SidebarLayout>
  );
}

export { DefaultErrorBoundary as ErrorBoundary } from "~/components/default-error-boundary";
