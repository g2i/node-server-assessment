import { promises as fs } from 'fs';
import { Database } from './index';
import { Movie } from './types';

describe('the database', () => {
  describe('all', () => {
    let db: Database;
    beforeEach(async () => {
      db = new Database();

      const data: Movie[] = [
        { title: 'Spider-Man', year: 2002 },
        { title: 'Alien', year: 1979 },
        { title: 'Knives Out', year: 2019 },
        { title: 'Lady and the Tramp', year: 1955 },
        { title: 'I\'m just making these up now', year: 2021 },
        { title: 'Still making up nonsense', year: 1776 }
      ];

      // I should have planned for a bulk insert...
      const insertResult = data.reduce(
        (insertsPomise, movie) => {
          return insertsPomise.then(() => {
            db.insert(movie);
            return;
          });
        }, Promise.resolve()
      );

      await insertResult;
    });

    it('provides all the records', async () => {
      const results = await db.all();
      expect(results).toHaveLength(6);
    });

    it('can paginate', async () => {
      const results = await db.all({ limit: 2 });
      expect(results).toMatchObject([
        { title: 'Spider-Man', year: 2002 },
        { title: 'Alien', year: 1979 },
      ]);

      const nextResults = await db.all({ limit: 2, offset: 2 });
      expect(nextResults).toMatchObject([
        { title: 'Knives Out', year: 2019 },
        { title: 'Lady and the Tramp', year: 1955 },
      ]);
    })

  });

  describe('inserts', () => {
    it('does them', async () => {
      const db = new Database();

      await db.insert({ title: 'Spider-Man', year: 2002 });
      await db.insert({ title: 'Alien', year: 1979 });

      expect(await db.all()).toEqual([
        { id: 1, title: 'Spider-Man', year: 2002 },
        { id: 2, title: 'Alien', year: 1979 }
      ]);
    });

    it('throws if inserting an existing id', async () => {
      expect.assertions(1);
      const db = new Database();

      try {
        await db.insert(1, { title: "Spider-Man", year: 2002 });
        await db.insert(1, { title: "Alien", year: 1979 });
      } catch (e) {
        expect(e).toHaveProperty('message', 'Existing id: 1');
      }
    });

    it('lets you delete a specific ID and add the same ID', async () => {
      const db = new Database();

      await db.insert(1, { title: 'Spider-Man', year: 2002 });
      await db.insert(2, { title: 'Alien', year: 1979 });
      await db.insert(3, { title: 'Varsity Blues', year: 1999 });
      await db.delete(2);
      await db.insert(2, { title: 'Aliens', year: 1986 });

      const all = await db.all();
      expect(all).toEqual([
        { id: 1, title: 'Spider-Man', year: 2002 },
        { id: 3, title: 'Varsity Blues', year: 1999 },
        { id: 2, title: 'Aliens', year: 1986 },
      ]);
    });

    it('does IDs properly if you delete', async () => {
      const db = new Database();

      await db.insert(1, { title: 'Spider-Man', year: 2002 });
      await db.insert(2, { title: 'Alien', year: 1979 });
      await db.insert(3, { title: 'Varsity Blues', year: 1999 });

      await db.delete(2);

      await db.insert({ title: 'Aliens', year: 1986 });

      const all = await db.all();

      expect(all).toEqual([
        { id: 1, title: 'Spider-Man', year: 2002 },
        { id: 3, title: 'Varsity Blues', year: 1999 },
        { id: 4, title: 'Aliens', year: 1986 },
      ])
    })
  });

  describe('Bulk inserts', () => {
    let db: Database;

    beforeEach(() => {
      db = new Database();
    });

    test('They work', async () => {
      const movies: Movie[] = await fs.readFile('./movies.json', { encoding: 'utf8' })
        .then((fileContents) => JSON.parse(fileContents))
        .then((records) => records.map((record: any): Movie => ({ title: record.title, year: record.year })));

      expect(movies.length).toEqual(28795);

      await db.bulkInsert(movies);

      // Just grab a chunk of movies to show it works
      const results = await db.all({ limit: 10 });

      expect(results.length).toEqual(10);
      expect(results[0]).toEqual({
        id: 1,
        title: 'After Dark in Central Park',
        year: 1900
      });
    });
  });

  describe('Get', () => {
    test('It works', async () => {
      const db = new Database();
      await db.insert(1, { title: 'Spider-Man', year: 2002 });

      const movie = await db.get(1);
      expect(movie).toEqual({
        id: 1,
        title: 'Spider-Man',
        year: 2002,
      });
    });

    test("It throws if the movie isn't there", () => {
      expect.assertions(1);
      const db = new Database();
      return expect(db.get(1))
        .rejects.toEqual(new Error('ID not found'));
    });
  })
});