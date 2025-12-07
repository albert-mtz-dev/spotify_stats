import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getTopArtists } from "@/lib/spotify";
import { ArtistsPageContent } from "@/components/dashboard/ArtistsPageContent";

export default async function ArtistsPage() {
  const session = await auth();

  if (!session?.accessToken) {
    redirect("/");
  }

  try {
    const [shortTerm, mediumTerm, longTerm] = await Promise.all([
      getTopArtists(session.accessToken, "short_term", 50),
      getTopArtists(session.accessToken, "medium_term", 50),
      getTopArtists(session.accessToken, "long_term", 50),
    ]);

    return (
      <ArtistsPageContent
        artists={{
          shortTerm,
          mediumTerm,
          longTerm,
        }}
      />
    );
  } catch (error) {
    console.error("Error fetching artists:", error);
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
        <h2 className="text-xl font-semibold text-text-primary mb-2">
          Unable to load artists
        </h2>
        <p className="text-text-secondary">
          There was an error loading your top artists.
        </p>
      </div>
    );
  }
}
