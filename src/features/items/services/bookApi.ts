type GoogleBooksResponse = {
  items?: Array<{
    volumeInfo: {
      title: string;
      authors?: string[];
      imageLinks?: {
        thumbnail: string;
      };
    };
  }>;
};

export async function fetchBookInfo(isbn: string) {
  const response = await fetch(
    `https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}`,
  );

  if (!response.ok) {
    throw new Error("書籍情報の取得に失敗しました");
  }

  const data: GoogleBooksResponse = await response.json();

  if (!data.items) {
    throw new Error("書籍が見つかりませんでした");
  }

  const book = data.items[0].volumeInfo;
  return {
    title: book.title,
    author: book.authors ? book.authors[0] : null,
    image: book.imageLinks?.thumbnail || null,
  };
}
