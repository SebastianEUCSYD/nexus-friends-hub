import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Smile } from "lucide-react";

const EMOJI_CATEGORIES = [
  {
    name: "Smileys",
    emojis: ["😀", "😃", "😄", "😁", "😆", "😅", "🤣", "😂", "🙂", "😊", "😇", "🥰", "😍", "🤩", "😘", "😗", "😚", "😙", "🥲", "😋", "😛", "😜", "🤪", "😝", "🤑", "🤗", "🤭", "🤫", "🤔", "🫡", "🤐", "🤨", "😐", "😑", "😶", "🫥", "😏", "😒", "🙄", "😬", "🤥", "😌", "😔", "😪", "🤤", "😴", "😷", "🤒", "🤕", "🤢", "🤮", "🥵", "🥶", "🥴", "😵", "🤯", "🤠", "🥳", "🥸", "😎", "🤓", "🧐"],
  },
  {
    name: "Hænder",
    emojis: ["👍", "👎", "👊", "✊", "🤛", "🤜", "👏", "🙌", "👐", "🤲", "🤝", "🙏", "✌️", "🤞", "🤟", "🤘", "🤙", "👈", "👉", "👆", "👇", "☝️", "✋", "🤚", "🖐️", "🖖", "👋", "🤏", "💪", "🦾"],
  },
  {
    name: "Hjerter",
    emojis: ["❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "🤍", "🤎", "💔", "❤️‍🔥", "❤️‍🩹", "💕", "💞", "💓", "💗", "💖", "💘", "💝", "💟"],
  },
  {
    name: "Ting",
    emojis: ["🔥", "⭐", "🌟", "✨", "💫", "🎉", "🎊", "🎈", "🎁", "🏆", "🥇", "⚽", "🏀", "🎮", "🎵", "🎶", "📸", "🎬", "☕", "🍕", "🍔", "🌮", "🍦", "🎂", "🍰", "🍻", "🥂", "🚀", "✈️", "🏠"],
  },
];

interface EmojiPickerProps {
  onSelect: (emoji: string) => void;
}

export function EmojiPicker({ onSelect }: EmojiPickerProps) {
  const [open, setOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState(0);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full shrink-0" type="button">
          <Smile className="h-5 w-5 text-muted-foreground" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-2" side="top" align="start">
        <div className="flex gap-1 mb-2 border-b border-border pb-2">
          {EMOJI_CATEGORIES.map((cat, i) => (
            <button
              key={cat.name}
              onClick={() => setActiveCategory(i)}
              className={`text-xs px-2 py-1 rounded-lg transition-colors ${
                activeCategory === i
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-secondary"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-8 gap-0.5 max-h-48 overflow-y-auto">
          {EMOJI_CATEGORIES[activeCategory].emojis.map((emoji) => (
            <button
              key={emoji}
              onClick={() => {
                onSelect(emoji);
                setOpen(false);
              }}
              className="h-8 w-8 flex items-center justify-center text-lg hover:bg-secondary rounded transition-colors"
            >
              {emoji}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
