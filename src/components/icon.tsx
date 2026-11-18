import {
  Archive,
  ArchiveArrowUp,
  ArrowDown,
  ArrowUp,
  Check,
  ChevronDown,
  ChevronRight,
  CircleExclamationPoint,
  Pencil,
  Pin,
  PinOff,
  Copy,
  Plus,
  RefreshCw,
  Search,
  Settings,
  Square,
  SquareCheck,
  SquarePen,
  Star,
  Trash,
  TextAlignStart,
} from 'lucide-react-native';

import { useTheme, type ColorToken } from '@/theme';

// Icons are referenced by role, so swapping a glyph happens here and nowhere else.
const icons = {
  menu: TextAlignStart,
  newChat: SquarePen,
  search: Search,
  settings: Settings,
  copy: Copy,
  check: Check,
  regenerate: RefreshCw,
  chevronDown: ChevronDown,
  chevronRight: ChevronRight,
  alert: CircleExclamationPoint,
  favorite: Star,
  rename: Pencil,
  pin: Pin,
  unpin: PinOff,
  archive: Archive,
  unarchive: ArchiveArrowUp,
  delete: Trash,
  plus: Plus,
  send: ArrowUp,
  scrollDown: ArrowDown,
  stop: Square,
  taskOpen: Square,
  taskDone: SquareCheck,
} as const;

export type IconName = keyof typeof icons;

type IconProps = {
  name: IconName;
  size?: 'sm' | 'md';
  color?: ColorToken;
  filled?: boolean;
};

export function Icon({ name, size = 'md', color = 'textSecondary', filled = false }: IconProps) {
  const { colors, sizes } = useTheme();
  const Glyph = icons[name];
  const tint = colors[color];
  return (
    <Glyph
      size={size === 'sm' ? sizes.iconSm : sizes.iconMd}
      color={tint}
      strokeWidth={sizes.iconStroke}
      fill={filled ? tint : 'none'}
    />
  );
}
