import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import {
  BookOpen,
  Check,
  ChevronLeft,
  ChevronRight,
  Download,
  Edit3,
  Eye,
  Heart,
  Image as ImageIcon,
  Maximize2,
  Music,
  Plus,
  Sliders,
  Sparkles,
  Trash2,
  Upload,
  VolumeX,
  X,
} from 'lucide-react';

interface Artwork {
  id: string;
  title: string;
  gallery: string;
  date: string;
  medium: string;
  caption: string;
  imageUrl: string;
  featured: boolean;
}

type StoredArtwork = Omit<Artwork, 'featured'> & { featured?: boolean };

interface ArtworkForm {
  title: string;
  gallery: string;
  date: string;
  medium: string;
  caption: string;
  imageUrl: string;
}

const INITIAL_ARTWORKS: Artwork[] = [
  {
    id: 'art-1',
    title: 'The First Spark of Morning Light',
    gallery: 'Gallery 01: Whispers & Sketches',
    date: 'Piece No. 01',
    medium: 'Ink & Watercolour on Paper',
    caption: 'A gentle reminder of quiet mornings and soft beginnings. Every line drawn with you in mind.',
    imageUrl: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?q=80&w=1000&auto=format&fit=crop',
    featured: true,
  },
  {
    id: 'art-2',
    title: 'Constellations of Kindness',
    gallery: 'Gallery 01: Whispers & Sketches',
    date: 'Piece No. 02',
    medium: 'Fineliner & Gold Dust',
    caption: 'Like stars connecting in the night sky, small moments together make the brightest patterns.',
    imageUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?q=80&w=1000&auto=format&fit=crop',
    featured: false,
  },
  {
    id: 'art-3',
    title: 'Garden of Quiet Thoughts',
    gallery: 'Gallery 02: Moments in Color',
    date: 'Piece No. 03',
    medium: 'Soft Pastels on Textured Paper',
    caption: 'A peaceful corner reserved for daydreaming, warmth, and gentle afternoon teas.',
    imageUrl: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?q=80&w=1000&auto=format&fit=crop',
    featured: true,
  },
  {
    id: 'art-4',
    title: 'The Unfinished Song of Autumn',
    gallery: 'Gallery 02: Moments in Color',
    date: 'Piece No. 04',
    medium: 'Acrylic & Botanical Dye',
    caption: 'Colors that stay warm even when the breeze turns cool.',
    imageUrl: 'https://images.unsplash.com/photo-1578926375605-eaf7559b1458?q=80&w=1000&auto=format&fit=crop',
    featured: false,
  },
];

const INITIAL_LETTER = `Dearest One,

Welcome to this little corner created entirely in celebration of you.

Each drawing here represents a thought, a memory, or a gentle wish for your journey ahead. Art has a way of holding feelings that words sometimes cannot express, and this museum is a small sanctuary built to honour your presence in the world.

May your birthday bring you quiet joy, soft laughter, and the warmth of knowing how deeply appreciated you are.

Happy Birthday. ♡`;

function isStoredArtworkArray(value: unknown): value is StoredArtwork[] {
  return Array.isArray(value) && value.every((item: unknown) => {
    if (typeof item !== 'object' || item === null) return false;
    const art = item as Record<string, unknown>;
    return (
      typeof art.id === 'string' &&
      typeof art.title === 'string' &&
      typeof art.gallery === 'string' &&
      typeof art.date === 'string' &&
      typeof art.medium === 'string' &&
      typeof art.caption === 'string' &&
      typeof art.imageUrl === 'string' &&
      (art.featured === undefined || typeof art.featured === 'boolean')
    );
  });
}

function readStoredArtworks(): Artwork[] {
  const savedArtworks = readStoredJson<StoredArtwork[]>('museum_artworks', INITIAL_ARTWORKS, isStoredArtworkArray);
  return savedArtworks.map((art) => ({ ...art, featured: art.featured ?? false }));
}

function readStoredJson<T>(key: string, fallback: T, isValid: (value: unknown) => value is T): T {
  try {
    const saved = window.localStorage.getItem(key);
    if (!saved) return fallback;
    const parsed: unknown = JSON.parse(saved);
    if (isValid(parsed)) return parsed;
    console.error(`Invalid ${key} data in local storage.`);
    return fallback;
  } catch (error) {
    console.error(`Unable to read ${key} from local storage:`, error);
    return fallback;
  }
}

function readStoredText(key: string, fallback: string): string {
  try {
    return window.localStorage.getItem(key) || fallback;
  } catch (error) {
    console.error(`Unable to read ${key} from local storage:`, error);
    return fallback;
  }
}

export default function App() {
  const [inGallery, setInGallery] = useState(false);
  const [artworks, setArtworks] = useState<Artwork[]>(readStoredArtworks);
  const [selectedArt, setSelectedArt] = useState<Artwork | null>(null);
  const [isManageOpen, setIsManageOpen] = useState(false);
  const [editingArt, setEditingArt] = useState<Artwork | null>(null);
  const [formData, setFormData] = useState<ArtworkForm>({
    title: '',
    gallery: 'Gallery 01: Whispers & Sketches',
    date: 'Piece No. 05',
    medium: 'Original Drawing',
    caption: '',
    imageUrl: '',
  });
  const [isLetterOpen, setIsLetterOpen] = useState(false);
  const [letterText, setLetterText] = useState(() => readStoredText('museum_letter_text', INITIAL_LETTER));
  const [isEditingLetter, setIsEditingLetter] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    try {
      window.localStorage.setItem('museum_artworks', JSON.stringify(artworks));
    } catch (error) {
      console.error('Unable to save artworks to local storage:', error);
    }
  }, [artworks]);

  useEffect(() => {
    try {
      window.localStorage.setItem('museum_letter_text', letterText);
    } catch (error) {
      console.error('Unable to save the note to local storage:', error);
    }
  }, [letterText]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setSelectedArt(null);
        setIsManageOpen(false);
        setIsLetterOpen(false);
        setIsEditingLetter(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const toggleAudio = async () => {
    if (!audioRef.current) return;
    if (isPlayingAudio) {
      audioRef.current.pause();
      setIsPlayingAudio(false);
      return;
    }

    try {
      await audioRef.current.play();
      setIsPlayingAudio(true);
    } catch (error) {
      console.error('Audio playback failed:', error);
    }
  };

  const handleFileUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      window.alert('Please choose an image file.');
      event.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => setFormData((previous) => ({ ...previous, imageUrl: String(reader.result) }));
    reader.onerror = () => {
      console.error('Unable to read the selected image:', reader.error);
      window.alert('The selected image could not be read. Please try another file.');
    };
    reader.readAsDataURL(file);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      gallery: 'Gallery 01: Whispers & Sketches',
      date: `Piece No. ${artworks.length + 1}`,
      medium: 'Original Drawing',
      caption: '',
      imageUrl: '',
    });
    setEditingArt(null);
  };

  const handleSaveArtwork = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!formData.imageUrl) {
      window.alert('Please upload or provide an image link for the artwork.');
      return;
    }

    if (editingArt) {
      setArtworks((previous) =>
        previous.map((art) =>
          art.id === editingArt.id ? { ...formData, id: editingArt.id, featured: editingArt.featured } : art,
        ),
      );
    } else {
      setArtworks((previous) => [
        ...previous,
        {
          ...formData,
          id: `art-${Date.now()}`,
          title: formData.title || 'Untitled Drawing',
          gallery: formData.gallery || 'Gallery 01: Whispers & Sketches',
          date: formData.date || `Piece No. ${previous.length + 1}`,
          medium: formData.medium || 'Original Artwork',
          caption: formData.caption || 'A lovely drawing made with care.',
          featured: false,
        },
      ]);
    }
    resetForm();
  };

  const handleEditClick = (art: Artwork) => {
    setEditingArt(art);
    setFormData({
      title: art.title,
      gallery: art.gallery,
      date: art.date,
      medium: art.medium,
      caption: art.caption,
      imageUrl: art.imageUrl,
    });
  };

  const handleDeleteArtwork = (id: string) => {
    if (!window.confirm('Are you sure you want to remove this piece from the exhibition?')) return;
    setArtworks((previous) => previous.filter((art) => art.id !== id));
    setSelectedArt((previous) => (previous?.id === id ? null : previous));
    if (editingArt?.id === id) resetForm();
  };

  const galleries = artworks.reduce<Record<string, Artwork[]>>((groups, art) => {
    const galleryName = art.gallery || 'Gallery 01: Special Collection';
    if (!groups[galleryName]) groups[galleryName] = [];
    groups[galleryName].push(art);
    return groups;
  }, {});

  const goToArtwork = (direction: -1 | 1) => {
    const currentIndex = artworks.findIndex((art) => art.id === selectedArt?.id);
    const nextIndex = (currentIndex + direction + artworks.length) % artworks.length;
    setSelectedArt(artworks[nextIndex]);
  };

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#F8F3E9] font-serif text-[#6E5745] selection:bg-[#E8DDCC]">
      <audio
        ref={audioRef}
        loop
        src="https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=soft-piano-10881.mp3"
      />

      <div className="fixed right-5 top-5 z-40 flex items-center gap-2">
        <button
          type="button"
          onClick={() => setIsManageOpen(true)}
          className="flex items-center gap-1.5 rounded-full border border-[#C7A66A]/40 bg-[#F8F3E9]/90 px-3 py-2 text-xs shadow-sm backdrop-blur-sm transition hover:bg-[#E8DDCC]"
          title="Manage and add artworks"
        >
          <Sliders size={14} className="text-[#C7A66A]" />
          <span className="hidden sm:inline">Curate Gallery</span>
        </button>
        <button
          type="button"
          onClick={toggleAudio}
          className="rounded-full border border-[#C7A66A]/40 bg-[#F8F3E9]/90 p-2.5 shadow-sm backdrop-blur-sm transition hover:bg-[#E8DDCC]"
          title={isPlayingAudio ? 'Pause background music' : 'Play gentle background music'}
          aria-label={isPlayingAudio ? 'Pause background music' : 'Play background music'}
        >
          {isPlayingAudio ? <Music size={16} className="text-[#C7A66A]" /> : <VolumeX size={16} />}
        </button>
      </div>

      {!inGallery ? (
        <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-[#F8F3E9] via-[#F3EBDD] to-[#E8DDCC] p-6 text-center">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(#C7A66A_1px,transparent_1px)] opacity-10 [background-size:24px_24px]" />
          <div className="pointer-events-none absolute left-12 top-12 h-24 w-24 border-l border-t border-[#C7A66A]/30" />
          <div className="pointer-events-none absolute bottom-12 right-12 h-24 w-24 border-b border-r border-[#C7A66A]/30" />
          <div className="relative z-10 mx-auto max-w-2xl space-y-6 px-4">
            <div className="mb-2 inline-flex items-center gap-2 font-sans text-xs uppercase tracking-[0.25em] text-[#C7A66A]">
              <Sparkles size={14} />
              <span>A Personal Birthday Exhibition</span>
              <Sparkles size={14} />
            </div>
            <h1 className="text-4xl font-normal italic leading-tight tracking-wide md:text-6xl">A Little Museum of You</h1>
            <p className="mx-auto max-w-lg text-base italic text-[#6E5745]/80 md:text-lg">
              “A collection of little things, made just for you.”
            </p>
            <button
              type="button"
              onClick={() => setInGallery(true)}
              className="group mt-8 inline-flex items-center gap-3 rounded-full bg-[#6E5745] px-8 py-3.5 font-sans text-sm uppercase tracking-wider text-[#F8F3E9] shadow-md transition hover:-translate-y-0.5 hover:bg-[#584536] hover:shadow-lg"
            >
              <span>Enter the Museum</span>
              <ChevronRight size={16} className="transition-transform group-hover:translate-x-1" />
            </button>
            <div className="pt-8 font-sans text-xs uppercase tracking-widest text-[#6E5745]/50">
              Curated with love for your special day
            </div>
          </div>
        </section>
      ) : (
        <div className="animate-fadeIn">
          <header className="sticky top-0 z-30 border-b border-[#E8DDCC] bg-[#F8F3E9]/90 px-6 py-4 backdrop-blur-md">
            <div className="mx-auto flex max-w-7xl items-center justify-between">
              <button
                type="button"
                onClick={() => setInGallery(false)}
                className="flex items-center gap-1 font-sans text-xs uppercase tracking-widest text-[#6E5745]/70 transition-colors hover:text-[#6E5745]"
              >
                <ChevronLeft size={14} />
                <span>Museum Entrance</span>
              </button>
              <div className="text-center">
                <h2 className="text-lg md:text-xl">A Little Museum of You</h2>
                <span className="block font-sans text-[10px] uppercase tracking-widest text-[#C7A66A]">Birthday Exhibition</span>
              </div>
              <button
                type="button"
                onClick={() => setIsLetterOpen(true)}
                className="rounded-full border border-[#D9A6A0]/40 px-3 py-1.5 font-sans text-xs transition-colors hover:bg-[#D9A6A0]/10"
              >
                Read Note ♡
              </button>
            </div>
          </header>

          <main className="mx-auto max-w-7xl px-6 py-12 md:py-16">
            <section className="mx-auto mb-12 max-w-2xl text-center">
              <div className="inline-flex items-center gap-2 font-sans text-xs uppercase tracking-[0.25em] text-[#C7A66A]">
                <Sparkles size={14} />
                <span>A collection made with love</span>
              </div>
              <h1 className="mt-4 text-3xl font-normal italic md:text-5xl">Little things, kept close</h1>
              <p className="mx-auto mt-4 max-w-lg text-sm leading-relaxed text-[#6E5745]/70 md:text-base">
                Each piece holds a thought, a memory, or a wish just for you.
              </p>
              <button
                type="button"
                onClick={() => setIsLetterOpen(true)}
                className="mt-6 inline-flex items-center gap-2 rounded-full border border-[#C7A66A]/50 px-5 py-2 text-sm transition hover:bg-white/50"
              >
                <BookOpen size={15} />
                Read your note
              </button>
            </section>

            {artworks.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-[#C7A66A]/50 bg-white/30 p-12 text-center">
                <ImageIcon size={28} className="mx-auto text-[#C7A66A]" />
                <p className="mt-4">The gallery is waiting for its first artwork.</p>
                <button
                  type="button"
                  onClick={() => setIsManageOpen(true)}
                  className="mt-4 rounded-full bg-[#6E5745] px-5 py-2 text-sm text-[#F8F3E9]"
                >
                  Add an artwork
                </button>
              </div>
            ) : (
              <div className="space-y-14">
                {Object.entries(galleries).map(([galleryName, galleryArtworks]) => (
                  <section key={galleryName}>
                    <div className="mb-6 flex items-center gap-3">
                      <span className="h-px flex-1 bg-[#C7A66A]/30" />
                      <h2 className="text-center text-sm uppercase tracking-[0.18em] text-[#8D7258]">{galleryName}</h2>
                      <span className="h-px flex-1 bg-[#C7A66A]/30" />
                    </div>
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                      {galleryArtworks.map((art) => (
                        <button
                          type="button"
                          key={art.id}
                          onClick={() => setSelectedArt(art)}
                          className="group overflow-hidden rounded-2xl border border-[#C7A66A]/20 bg-white/50 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                        >
                          <div className="relative aspect-[4/3] overflow-hidden bg-[#E8DDCC]">
                            <img
                              src={art.imageUrl}
                              alt={art.title}
                              loading="lazy"
                              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                            />
                            {art.featured && (
                              <span className="absolute left-3 top-3 rounded-full bg-[#F8F3E9]/90 px-3 py-1 font-sans text-[10px] uppercase tracking-wider">
                                <Heart size={11} className="mr-1 inline text-[#D9A6A0]" />
                                Featured
                              </span>
                            )}
                            <span className="absolute bottom-3 right-3 rounded-full bg-[#F8F3E9]/90 p-2 opacity-0 transition group-hover:opacity-100">
                              <Maximize2 size={15} />
                            </span>
                          </div>
                          <div className="p-5">
                            <div className="font-sans text-[10px] uppercase tracking-[0.16em] text-[#C7A66A]">{art.date}</div>
                            <h3 className="mt-2 text-xl italic">{art.title}</h3>
                            <p className="mt-1 text-xs text-[#6E5745]/60">{art.medium}</p>
                            {art.caption && (
                              <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-[#6E5745]/75">{art.caption}</p>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            )}

            <footer className="mt-20 border-t border-[#C7A66A]/25 pt-8 text-center font-sans text-xs uppercase tracking-widest text-[#6E5745]/50">
              Curated with love for your special day <Heart size={12} className="ml-1 inline text-[#D9A6A0]" />
            </footer>
          </main>
        </div>
      )}

      {selectedArt && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#30251e]/85 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label={selectedArt.title}
          onClick={() => setSelectedArt(null)}
        >
          <div
            className="relative grid max-h-[90vh] w-full max-w-5xl overflow-hidden rounded-2xl bg-[#F8F3E9] md:grid-cols-[1.35fr_1fr]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="relative flex min-h-64 items-center justify-center bg-[#2c241f]">
              <img src={selectedArt.imageUrl} alt={selectedArt.title} className="max-h-[70vh] w-full object-contain" />
              {artworks.length > 1 && (
                <>
                  <button type="button" aria-label="Previous artwork" onClick={() => goToArtwork(-1)} className="absolute left-3 rounded-full bg-[#F8F3E9]/90 p-2">
                    <ChevronLeft size={18} />
                  </button>
                  <button type="button" aria-label="Next artwork" onClick={() => goToArtwork(1)} className="absolute right-3 rounded-full bg-[#F8F3E9]/90 p-2">
                    <ChevronRight size={18} />
                  </button>
                </>
              )}
            </div>
            <div className="relative overflow-y-auto p-7 md:p-10">
              <button
                type="button"
                aria-label="Close artwork"
                onClick={() => setSelectedArt(null)}
                className="absolute right-4 top-4 rounded-full p-2 hover:bg-[#E8DDCC]"
              >
                <X size={18} />
              </button>
              <div className="mt-8 font-sans text-xs uppercase tracking-[0.18em] text-[#C7A66A]">{selectedArt.date}</div>
              <h2 className="mt-3 text-3xl italic">{selectedArt.title}</h2>
              <p className="mt-2 text-sm text-[#6E5745]/60">{selectedArt.medium}</p>
              <div className="my-6 h-px bg-[#C7A66A]/30" />
              <p className="whitespace-pre-wrap text-base leading-relaxed">{selectedArt.caption}</p>
              <a
                href={selectedArt.imageUrl}
                download
                className="mt-8 inline-flex items-center gap-2 rounded-full border border-[#C7A66A]/50 px-4 py-2 text-sm hover:bg-white/50"
              >
                <Download size={15} />
                Save image
              </a>
            </div>
          </div>
        </div>
      )}

      {isManageOpen && (
        <div
          className="fixed inset-0 z-50 flex justify-end bg-[#30251e]/45 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label="Curate gallery"
          onClick={() => setIsManageOpen(false)}
        >
          <aside
            className="h-full w-full max-w-xl overflow-y-auto bg-[#F8F3E9] p-6 shadow-2xl md:p-8"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-6 flex items-center justify-between">
              <div>
                <div className="font-sans text-xs uppercase tracking-[0.18em] text-[#C7A66A]">Gallery studio</div>
                <h2 className="mt-1 text-2xl italic">{editingArt ? 'Edit artwork' : 'Curate your gallery'}</h2>
              </div>
              <button
                type="button"
                aria-label="Close gallery studio"
                onClick={() => {
                  setIsManageOpen(false);
                  resetForm();
                }}
                className="rounded-full p-2 hover:bg-[#E8DDCC]"
              >
                <X size={19} />
              </button>
            </div>

            <form onSubmit={handleSaveArtwork} className="space-y-4">
              <label className="block text-sm">
                Title
                <input
                  value={formData.title}
                  onChange={(event) => setFormData({ ...formData, title: event.target.value })}
                  className="mt-1 w-full rounded-lg border border-[#C7A66A]/40 bg-white/70 px-3 py-2 outline-none focus:border-[#8D7258]"
                  placeholder="A little title for this piece"
                />
              </label>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label className="block text-sm">
                  Gallery
                  <input
                    value={formData.gallery}
                    onChange={(event) => setFormData({ ...formData, gallery: event.target.value })}
                    className="mt-1 w-full rounded-lg border border-[#C7A66A]/40 bg-white/70 px-3 py-2 outline-none focus:border-[#8D7258]"
                  />
                </label>
                <label className="block text-sm">
                  Piece number
                  <input
                    value={formData.date}
                    onChange={(event) => setFormData({ ...formData, date: event.target.value })}
                    className="mt-1 w-full rounded-lg border border-[#C7A66A]/40 bg-white/70 px-3 py-2 outline-none focus:border-[#8D7258]"
                  />
                </label>
              </div>
              <label className="block text-sm">
                Medium
                <input
                  value={formData.medium}
                  onChange={(event) => setFormData({ ...formData, medium: event.target.value })}
                  className="mt-1 w-full rounded-lg border border-[#C7A66A]/40 bg-white/70 px-3 py-2 outline-none focus:border-[#8D7258]"
                />
              </label>
              <label className="block text-sm">
                Caption
                <textarea
                  value={formData.caption}
                  onChange={(event) => setFormData({ ...formData, caption: event.target.value })}
                  rows={3}
                  className="mt-1 w-full resize-y rounded-lg border border-[#C7A66A]/40 bg-white/70 px-3 py-2 outline-none focus:border-[#8D7258]"
                />
              </label>
              <label className="block text-sm">
                Image link
                <input
                  type="url"
                  value={formData.imageUrl.startsWith('data:') ? '' : formData.imageUrl}
                  onChange={(event) => setFormData({ ...formData, imageUrl: event.target.value })}
                  className="mt-1 w-full rounded-lg border border-[#C7A66A]/40 bg-white/70 px-3 py-2 outline-none focus:border-[#8D7258]"
                  placeholder="https://..."
                />
              </label>
              <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-[#C7A66A]/60 px-4 py-4 text-sm hover:bg-white/40">
                <Upload size={17} />
                Upload an image from your device
                <input type="file" accept="image/*" onChange={handleFileUpload} className="sr-only" />
              </label>
              {formData.imageUrl && (
                <div className="relative">
                  <img src={formData.imageUrl} alt="Artwork preview" className="h-40 w-full rounded-xl object-cover" />
                  <button
                    type="button"
                    aria-label="Remove selected image"
                    onClick={() => setFormData({ ...formData, imageUrl: '' })}
                    className="absolute right-2 top-2 rounded-full bg-white/90 p-2"
                  >
                    <X size={15} />
                  </button>
                </div>
              )}
              <button
                type="submit"
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#6E5745] px-5 py-3 font-sans text-sm tracking-wider text-[#F8F3E9] hover:bg-[#584536]"
              >
                {editingArt ? <Check size={16} /> : <Plus size={16} />}
                {editingArt ? 'Save changes' : 'Add artwork'}
              </button>
            </form>

            <div className="mt-10 border-t border-[#C7A66A]/30 pt-6">
              <h3 className="mb-3 font-sans text-xs uppercase tracking-[0.18em] text-[#8D7258]">Exhibited pieces</h3>
              {artworks.length === 0 ? (
                <p className="text-sm text-[#6E5745]/60">No artworks have been added yet.</p>
              ) : (
                <ul className="space-y-2">
                  {artworks.map((art) => (
                    <li key={art.id} className="flex items-center gap-3 rounded-lg bg-white/50 p-2">
                      <img src={art.imageUrl} alt="" className="h-12 w-12 rounded object-cover" />
                      <span className="min-w-0 flex-1 truncate text-sm">{art.title}</span>
                      <button type="button" aria-label={`Edit ${art.title}`} onClick={() => handleEditClick(art)} className="rounded-full p-2 hover:bg-[#E8DDCC]">
                        <Edit3 size={15} />
                      </button>
                      <button
                        type="button"
                        aria-label={`View ${art.title}`}
                        onClick={() => {
                          setSelectedArt(art);
                          setIsManageOpen(false);
                        }}
                        className="rounded-full p-2 hover:bg-[#E8DDCC]"
                      >
                        <Eye size={15} />
                      </button>
                      <button type="button" aria-label={`Delete ${art.title}`} onClick={() => handleDeleteArtwork(art.id)} className="rounded-full p-2 text-[#9B5148] hover:bg-[#F2DEDA]">
                        <Trash2 size={15} />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </aside>
        </div>
      )}

      {isLetterOpen && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-[#30251e]/65 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label="Your birthday note"
          onClick={() => setIsLetterOpen(false)}
        >
          <section
            className="relative max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl border border-[#C7A66A]/30 bg-[#FBF7EF] p-8 shadow-2xl md:p-12"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              aria-label="Close note"
              onClick={() => {
                setIsLetterOpen(false);
                setIsEditingLetter(false);
              }}
              className="absolute right-4 top-4 rounded-full p-2 hover:bg-[#E8DDCC]"
            >
              <X size={18} />
            </button>
            <div className="text-center">
              <Heart size={20} className="mx-auto text-[#D9A6A0]" />
              <h2 className="mt-3 text-3xl italic">A little note for you</h2>
            </div>
            {isEditingLetter ? (
              <textarea
                value={letterText}
                onChange={(event) => setLetterText(event.target.value)}
                rows={12}
                autoFocus
                className="mt-8 w-full resize-y rounded-lg border border-[#C7A66A]/40 bg-white/70 p-4 leading-relaxed outline-none focus:border-[#8D7258]"
              />
            ) : (
              <p className="mt-8 whitespace-pre-wrap text-center text-base leading-8">{letterText}</p>
            )}
            <div className="mt-8 flex justify-center">
              <button
                type="button"
                onClick={() => setIsEditingLetter(!isEditingLetter)}
                className="inline-flex items-center gap-2 rounded-full border border-[#C7A66A]/50 px-5 py-2 text-sm hover:bg-white/60"
              >
                {isEditingLetter ? <Check size={15} /> : <Edit3 size={15} />}
                {isEditingLetter ? 'Done' : 'Edit note'}
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
