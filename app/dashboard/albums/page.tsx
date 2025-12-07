import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getTopTracks } from "@/lib/spotify";
import { extractTopAlbumsFromTracks } from "@/lib/analytics";
import { AlbumsPageContent } from "@/components/dashboard/AlbumsPageContent";

export default async function AlbumsPage() {
  const session = await auth();

  if (!session?.accessToken) {
    redirect("/");
  }

  try {
    const [shortTermTracks, mediumTermTracks, longTermTracks] =
      await Promise.all([
        getTopTracks(session.accessToken, "short_term", 50),
        getTopTracks(session.accessToken, "medium_term", 50),
        getTopTracks(session.accessToken, "long_term", 50),
      ]);

    const albums = {
      shortTerm: extractTopAlbumsFromTracks(shortTermTracks),
      mediumTerm: extractTopAlbumsFromTracks(mediumTermTracks),
      longTerm: extractTopAlbumsFromTracks(longTermTracks),
    };

    return <AlbumsPageContent albums={albums} />;
  } catch (error) {
    console.error("Error fetching albums:", error);
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
        <h2 className="text-xl font-semibold text-text-primary mb-2">
          Unable to load albums
        </h2>
        <p className="text-text-secondary">
          There was an error loading your top albums.
        </p>
      </div>
    );
  }
}
