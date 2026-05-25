import { eq } from 'drizzle-orm';
import { db } from './db/index.js';
import { book, bookCategory, category } from './db/schema.js';

type CategoryName = 'fantasy' | 'romance' | 'horror';
type SeedBook = typeof book.$inferInsert;

type Author = {
  key: string;
  name: string;
};

type Work = {
  key: string;
  title: string;
  cover_id?: number;
  authors?: Author[];
  first_publish_year?: number;
};

type BookList = {
  key: string;
  name: string;
  subject_type: string;
  solr_query: string;
  work_count: number;
  works: Work[];
};

type FrenchEdition = {
  title: string | null;
  isbn: string | null;
  publisher: string | null;
  publishDate: string | null;
};

type OpenLibraryEdition = {
  title?: string;
  full_title?: string;
  isbn_10?: string[];
  isbn_13?: string[];
  publishers?: string[];
  publish_date?: string;
  languages?: { key?: string }[];
};

type WorkDetail = {
  description?: string | { value?: string };
  first_publish_date?: string;
};

const categoriesToSeed: CategoryName[] = ['fantasy', 'romance', 'horror'];
const openLibraryHeaders = {
  Accept: 'application/json',
  'User-Agent': 'Blablabook seed script (local development)',
};

async function seed() {
  console.log('start seed database');

  await seedCategory();
  let insertedBooksCount = 0;

  for (const categoryName of categoriesToSeed) {
    const categoryId = await getCategoryId(categoryName);
    const books = await getBooks(categoryName);

    for (const bookToInsert of books) {
      await insertBook(bookToInsert, categoryId);
      insertedBooksCount++;
    }
  }

  if (insertedBooksCount === 0) {
    throw new Error(
      'Aucun livre seedé : Open Library ne répond pas correctement depuis cet environnement.',
    );
  }

  console.log('seeding finished');
}

seed().catch((error) => {
  console.error('Erreur :', error);
  process.exit(1);
});

async function insertBook(bookToInsert: SeedBook, categoryId: number) {
  const createdBook = await db
    .insert(book)
    .values(bookToInsert)
    .onConflictDoNothing({ target: book.isbn })
    .returning();

  const persistedBook =
    createdBook[0] ??
    (await db.select().from(book).where(eq(book.isbn, bookToInsert.isbn)))[0];

  if (!persistedBook) {
    throw new Error(`Livre introuvable apres insertion : ${bookToInsert.name}`);
  }

  await db
    .insert(bookCategory)
    .values({
      categoryId,
      bookId: persistedBook.id,
    })
    .onConflictDoNothing();
}

async function getBooks(categoryName: CategoryName): Promise<SeedBook[]> {
  const { works = [] } = await fetchBook(categoryName);
  const books: SeedBook[] = [];

  for (const work of works) {
    const detail = await getDetailBook(work.key);
    const frenchEdition = await getFrenchEdition(work.key);
    const isbn = frenchEdition?.isbn;

    if (!isbn) {
      continue;
    }

    books.push({
      key: work.key,
      name: frenchEdition.title ?? work.title,
      coverId: work.cover_id?.toString() ?? '',
      author: work.authors?.[0]?.name ?? 'Auteur inconnu',
      description: parseDescription(detail?.description),
      isbn,
      publishingHouse: frenchEdition.publisher ?? 'Editeur inconnu',
      publishedAt: getPublishedAt(frenchEdition, detail, work),
    });
  }

  console.log(`${books.length} livres recuperes pour ${categoryName}`);

  return books;
}

function parseDescription(description: WorkDetail['description']) {
  if (typeof description === 'string') {
    return description;
  }

  return description?.value ?? 'Description indisponible';
}

function getPublishedAt(
  edition: FrenchEdition | null,
  detail: WorkDetail | null,
  work: Work,
) {
  const fallbackYear = work.first_publish_year ?? new Date().getFullYear();
  const rawDate = edition?.publishDate ?? detail?.first_publish_date;

  if (!rawDate) {
    return `${fallbackYear}-01-01`;
  }

  const parsedDate = new Date(rawDate);

  if (Number.isNaN(parsedDate.getTime())) {
    return `${fallbackYear}-01-01`;
  }

  return parsedDate.toISOString().slice(0, 10);
}

function getEditionIsbn(edition: OpenLibraryEdition) {
  return edition.isbn_13?.[0] ?? edition.isbn_10?.[0] ?? null;
}

function getFrenchEditionScore(edition: OpenLibraryEdition) {
  const title = edition.title ?? edition.full_title ?? null;
  const isbn = getEditionIsbn(edition);
  const publisher = edition.publishers?.[0] ?? null;

  return (
    Number(Boolean(title)) + Number(Boolean(isbn)) + Number(Boolean(publisher))
  );
}

async function getFrenchEdition(key: string): Promise<FrenchEdition | null> {
  const endpoint = `https://openlibrary.org${key}/editions.json`;

  try {
    const res = await fetchWithRetry(endpoint);

    if (!res.ok) {
      throw new Error(
        await getFetchErrorMessage(res, 'Failed to fetch editions'),
      );
    }

    const data = (await res.json()) as { entries?: OpenLibraryEdition[] };

    const frenchEditions = (data.entries ?? []).filter((edition) =>
      edition.languages?.some((lang) => lang.key === '/languages/fre'),
    );

    const frenchEdition = frenchEditions.sort(
      (a, b) => getFrenchEditionScore(b) - getFrenchEditionScore(a),
    )[0];

    if (!frenchEdition) {
      return null;
    }

    return {
      title: frenchEdition.title ?? frenchEdition.full_title ?? null,
      isbn: getEditionIsbn(frenchEdition),
      publisher: frenchEdition.publishers?.[0] ?? null,
      publishDate: frenchEdition.publish_date ?? null,
    };
  } catch (err) {
    console.warn(`Edition francaise ignoree pour ${key}:`, err);
    return null;
  }
}

async function getDetailBook(key: string): Promise<WorkDetail | null> {
  const endpoint = `https://openlibrary.org${key}.json`;

  try {
    const res = await fetchWithRetry(endpoint);

    if (!res.ok) {
      throw new Error(
        await getFetchErrorMessage(res, 'Failed to get detail info'),
      );
    }

    return (await res.json()) as WorkDetail;
  } catch (err) {
    console.warn(`Details ignores pour ${key}:`, err);
    return null;
  }
}

async function getCategoryId(name: CategoryName) {
  const foundCategories = await db
    .select()
    .from(category)
    .where(eq(category.name, name));
  const foundCategory = foundCategories[0];

  if (!foundCategory) {
    throw new Error(`Categorie introuvable : ${name}`);
  }

  return foundCategory.id;
}

async function fetchBook(categoryName: CategoryName): Promise<BookList> {
  const endpoint = `https://openlibrary.org/subjects/${categoryName}.json?limit=20`;

  try {
    const res = await fetchWithRetry(endpoint);

    if (!res.ok) {
      throw new Error(
        await getFetchErrorMessage(
          res,
          `Failed to access endpoint: ${categoryName}`,
        ),
      );
    }

    return (await res.json()) as BookList;
  } catch (err) {
    console.warn(`Categorie Open Library ignoree pour ${categoryName}:`, err);
    return {
      key: '',
      name: categoryName,
      subject_type: '',
      solr_query: '',
      work_count: 0,
      works: [],
    };
  }
}

async function fetchWithRetry(endpoint: string, maxAttempts = 3) {
  let lastError: unknown;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const response = await fetch(endpoint, {
        headers: openLibraryHeaders,
      });

      if (response.ok || attempt === maxAttempts) {
        return response;
      }

      lastError = new Error(`HTTP ${response.status} ${response.statusText}`);
    } catch (err) {
      lastError = err;
    }

    await delay(1000 * attempt);
  }

  throw lastError;
}

async function getFetchErrorMessage(response: Response, message: string) {
  const body = await response.text();
  const responseBody = body ? ` - ${body.slice(0, 200)}` : '';

  return `${message}: HTTP ${response.status} ${response.statusText}${responseBody}`;
}

function delay(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function seedCategory() {
  console.log('Start seeding category');

  await db
    .insert(category)
    .values(categoriesToSeed.map((name) => ({ name })))
    .onConflictDoNothing({ target: category.name });

  console.log('category seeding finished');
}
