/** Local Unsplash-sourced images for edupass marketing surfaces. */

export const images = {
  hero: "/images/hero-seminar.jpg",
  students: "/images/students.jpg",
  institute: "/images/institute.jpg",
  classroom: "/images/pass-classroom.jpg",
} as const;

const SUBJECT_IMAGES: Record<string, string> = {
  "Combined Mathematics": "/images/pass-maths.jpg",
  Mathematics: "/images/pass-maths.jpg",
  Physics: "/images/pass-physics.jpg",
  Biology: "/images/pass-biology.jpg",
  Chemistry: "/images/pass-chemistry.jpg",
  Science: "/images/pass-science.jpg",
};

export function seminarImage(subject: string) {
  return SUBJECT_IMAGES[subject] ?? images.classroom;
}

export const lecturerPhotos = [
  "/images/lecturer-1.jpg",
  "/images/lecturer-2.jpg",
  "/images/lecturer-3.jpg",
  "/images/lecturer-4.jpg",
  "/images/lecturer-5.jpg",
  "/images/lecturer-6.jpg",
] as const;

const LECTURER_BY_SLUG: Record<string, string> = {
  "k-perera": "/images/lecturer-1.jpg",
  "d-silva": "/images/lecturer-2.jpg",
  "n-fernando": "/images/lecturer-3.jpg",
  "s-bandara": "/images/lecturer-4.jpg",
  "m-jayawardena": "/images/lecturer-5.jpg",
  "a-rathnayake": "/images/lecturer-6.jpg",
};

export function lecturerPhoto(index: number) {
  return lecturerPhotos[index % lecturerPhotos.length];
}

export function lecturerPhotoBySlug(slug: string) {
  return LECTURER_BY_SLUG[slug] ?? lecturerPhotos[0];
}
