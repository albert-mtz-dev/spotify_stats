import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getTopTracks } from "@/lib/spotify";
import { TracksPageContent } from "@/components/dashboard/TracksPageContent";

export default async function TracksPage() {
  const session = await auth();

  if (!session?.accessToken) {
    redirect("/");
  }

  try {
    const [shortTerm, mediumTerm, longTerm] = await Promise.all([
      getTopTracks(session.accessToken, "short_term", 50),
      getTopTracks(session.accessToken, "medium_term", 50),
      getTopTracks(session.accessToken, "long_term", 50),
    ]);

    return (
      <TracksPageContent
        tracks={{
          shortTerm,
          mediumTerm,
          longTerm,
        }}
      />
    );
  } catch (error) {
    console.error("Error fetching tracks:", error);
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
        <h2 className="text-xl font-semibold text-text-primary mb-2">
          Unable to load tracks
        </h2>
        <p className="text-text-secondary">
          There was an error loading your top tracks.
        </p>
      </div>
    );
  }
}
