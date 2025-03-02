type DiscogsResponse = {
  results: Array<{
    title: string;
    artist?: string;
    cover_image?: string;
    format?: string[];
  }>;
};

export async function fetchMusicInfo(barcode: string) {
  const response = await fetch(
    `https://api.discogs.com/database/search?barcode=${barcode}`,
    {
      headers: {
        Authorization: `Discogs token=${import.meta.env.VITE_DISCOGS_TOKEN}`,
        "User-Agent": "YourAppName/1.0",
      },
    },
  );

  if (!response.ok) {
    throw new Error("音楽情報の取得に失敗しました");
  }

  const data: DiscogsResponse = await response.json();

  if (!data.results.length) {
    throw new Error("音楽作品が見つかりませんでした");
  }

  const music = data.results[0];
  return {
    title: music.title,
    author: music.artist || null,
    image: music.cover_image || null,
    format: music.format ? music.format.join(", ") : null,
  };
}
