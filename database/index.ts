import fs from 'fs';
import path from 'path';
import { Movie, MovieRecord } from './types';

const isNumber = (record: any): record is number => {
  return (typeof record === 'number');
}

/** Options for {@link Database.all} */
export interface AllQueryOptions {
  /** Limit the request to `limit` records */
  limit?: number;
  /**
   * Skip `offset` records in the query.
   * To be used in conjunction with {@link AllQueryOptions.limit}
   * to allow pagination.
   */
  offset?: number;
}

/**
 * A small in-memory database for movies.
 * 
 * @remarks
 * 
 * This database does not persist its data at all. If the process dies,
 * so do your changes.
 */
export class Database {
  #data: Map<number, MovieRecord>;
  #maximumID: number = 0;

  /**
   * Uses the `movies.json` file to populate a database with some 28000 records.
   */
  static createPreseededDatabase(): Database {
    const db = new Database();
    const movieText = fs.readFileSync(path.join(__dirname, 'movies.json'), { encoding: 'utf8' });
    const movies = (JSON.parse(movieText) as any[])
      .map((record: any): Movie => ({ title: record.title, year: record.year }));

    db.#bulkInsertSync(movies);

    return db;
  }

  constructor() {
    this.#data = new Map();
  }

  /**
   * Insert a partially-formed record.
   * An ID will be generated.
   */
  insert(movie: Movie): Promise<MovieRecord>;
  /**
   * Optionally provide a specific ID
   * @param id
   * @param movie
   */
  insert(id: number, movie: Movie): Promise<MovieRecord>;
  async insert(first: Movie | number, data?: Movie): Promise<MovieRecord> {
    let record: MovieRecord;
    if (isNumber(first)) {
      if (!data) throw new Error('Missing data!');
      if (this.#data.has(first)) {
        throw new Error(`Existing id: ${first}`);
      }
      record = {
        ...data,
        id: first,
      };
    } else {
      record = {
        ...first,
        id: this.#maximumID + 1,
      }
    }

    this.#data.set(record.id, record);

    for (const id of this.#data.keys()) {
      if (id > this.#maximumID) {
        this.#maximumID = id;
      }
    }
    return record;
  }

  #bulkInsertSync(movies: Movie[]) {
    for (const movie of movies) {
      const nextId = this.#maximumID + 1;
      this.#data.set(nextId, { ...movie, id: nextId });
      this.#maximumID = this.#maximumID + 1;
    }
  }

  async bulkInsert(movies: Movie[]) {
    this.#bulkInsertSync(movies);
  }

  async delete(id: number) {
    if (!this.#data.has(id)) {
      throw new Error(`ID ${id} does not exist`);
    }

    this.#data.delete(id);
  }

  /**
   * Request a bunch of records. 
   * @see {@link AllQueryOptions} for options
   * @returns a list of records wrapped in a promise
   */
  async all({ limit, offset }: AllQueryOptions = {}): Promise<MovieRecord[]> {
    const all = [];
    let selected = 0;
    let skipped = 0;
    for (const movie of this.#data.values()) {
      if (offset && skipped < offset) {
        skipped = skipped + 1;
        continue;
      }
      all.push(movie);
      selected = selected + 1;
      if (limit && selected == limit) {
        break;
      }
    }
    return all;
  }

  /**
   * Requests a single movie from the database.
   * @param id 
   * @returns a promise that will resolve to the requested movie record,
   * or reject with an error.
   */
  async get(id: number): Promise<MovieRecord> {
    if (!this.#data.has(id)) {
      throw new Error('ID not found');
    }

    // We already know the movie is there because we just checked.
    // Thus, we can tell the compiler to stop worrying about undefined.
    return this.#data.get(id)!;
  }
}