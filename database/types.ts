export interface Movie {
  title: string;
  year: number;
}

export interface MovieRecord extends Movie {
  id: number;
}