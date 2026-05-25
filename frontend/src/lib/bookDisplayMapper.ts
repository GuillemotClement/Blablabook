import type { BookRow } from "@/@types/books";
import type { ExternalBook } from "@/@types/externalBooks";
import type { BookDisplay } from "@/@types/books";

function mapCover(coverId: string) {
  if (!coverId) return "";
  if (coverId.startsWith("http") || coverId.startsWith("/")) return coverId;
  return `https://covers.openlibrary.org/b/id/${coverId}-M.jpg`;
}

// Maps a BookRow (internal) to a BookDisplay
export function mapBookRowToDisplay(book: BookRow): BookDisplay {
  return {
    key: book.id.toString(),
    title: book.name,
    author: book.author,
    cover: mapCover(book.coverId),
    isbn: book.isbn,
    categories: book.categories ?? [],
  };
}

// Maps an ExternalBook (external) to a BookDisplay
export function mapExternalBookToDisplay(book: ExternalBook): BookDisplay {
  return {
    key: book.key,
    title: book.title,
    author: book.author,
    cover: book.cover ?? "",
    isbn: book.isbn,
    categories: book.categories ?? [],
  };
}
