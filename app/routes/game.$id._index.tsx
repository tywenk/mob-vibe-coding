import { redirect } from "react-router";
import {
  getGameIteration,
  getGameIterationsByGameId,
} from "~/crud/game.server";
import type { Route } from "./+types/game.$id._index";

export async function loader({ context, request, params }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const iterVersion = Number(url.searchParams.get("v") ?? NaN);

  const gameId = Number(params.id);
  if (isNaN(gameId)) throw redirect("/");

  // If we have an iteration version, get the iteration content,
  // otherwise get the most recent iteration content
  if (iterVersion && !isNaN(iterVersion)) {
    const iter = await getGameIteration(context.db, iterVersion);
    if (!iter) {
      throw new Response("Iteration not found", { status: 404 });
    }

    return { content: iter.content, hasIterations: true };
  } else {
    const iter = await getGameIterationsByGameId(context.db, gameId, {
      sortBy: "created_at",
      direction: "desc",
      limit: 1,
    });
    if (iter.length === 0) {
      return { content: undefined, hasIterations: false };
    }
    return { content: iter[0].content, hasIterations: true };
  }
}

export default function GamePage({ loaderData }: Route.ComponentProps) {
  if (!loaderData.hasIterations) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-4">No iterations yet</h2>
          <p className="text-muted-foreground mb-6">
            Start iterating to build your game!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1">
      <iframe
        srcDoc={loaderData.content}
        className="w-full h-full"
        sandbox="allow-scripts allow-same-origin"
        title="Game content"
      />
    </div>
  );
}

export { DefaultErrorBoundary as ErrorBoundary } from "~/components/default-error-boundary";
