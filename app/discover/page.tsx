import { UserSearch } from "@/components/discover/UserSearch";
import { RecentlyJoined } from "@/components/discover/RecentlyJoined";

export const metadata = {
  title: "Discover | Spotify Mirror",
  description: "Discover other music lovers and explore their music taste",
};

export default function DiscoverPage() {
  return (
    <main className="max-w-2xl mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text-primary">Discover</h1>
        <p className="text-text-secondary mt-2">
          Find other users and explore their music taste
        </p>
      </div>

      <UserSearch />

      <div className="mt-12">
        <RecentlyJoined />
      </div>
    </main>
  );
}
