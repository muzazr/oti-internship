export interface ClassData {
  id: string;
  name: string;
  coverImage: string;
  studentCount: number;
  isPinned: boolean;
  avatars: string[];
  buttonLabel: string;
}

export const mockClasses: ClassData[] = [
  {
    id: "1",
    name: "Matematika - X IPA 1",
    coverImage: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=600&h=256&fit=crop",
    studentCount: 32,
    isPinned: true,
    avatars: [
      "https://i.pravatar.cc/64?img=1",
      "https://i.pravatar.cc/64?img=2",
    ],
    buttonLabel: "Detail Kelas",
  },
  {
    id: "2",
    name: "Matematika - XI IPA 2",
    coverImage: "https://images.unsplash.com/photo-1509228468518-180dd4864904?w=600&h=256&fit=crop",
    studentCount: 30,
    isPinned: true,
    avatars: [
      "https://i.pravatar.cc/64?img=3",
      "https://i.pravatar.cc/64?img=4",
    ],
    buttonLabel: "Detail Kelas",
  },
  {
    id: "3",
    name: "Matematika - XII IPA 3",
    coverImage: "https://images.unsplash.com/photo-1596495578065-6e0763fa1178?w=600&h=256&fit=crop",
    studentCount: 30,
    isPinned: true,
    avatars: [
      "https://i.pravatar.cc/64?img=5",
      "https://i.pravatar.cc/64?img=6",
    ],
    buttonLabel: "Open class",
  },
];
