import { TournamentsBrowser } from "@/components/public/TournamentsBrowser";
import { getTorneos } from "@/lib/queries/tournaments";

export const metadata = { title: "Torneos — CR&LB team" };

export default async function TorneosPage() {
  const torneos = await getTorneos();

  return (
    <div className="py-10 sm:py-14">
      <div className="mx-auto max-w-6xl">
        <h1 className="px-4 font-heading text-3xl text-white sm:px-6 sm:text-4xl">
          Torneos
        </h1>
        <div className="mt-6">
          <TournamentsBrowser torneos={torneos} />
        </div>
      </div>
    </div>
  );
}
