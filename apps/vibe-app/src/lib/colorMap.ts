const MAP: Record<string, string> = {
  أبيض:    "#FFFFFF",
  أزرق:    "#4A90D9",
  وردي:    "#F4A7B9",
  أسود:    "#1A1A1A",
  أحمر:    "#E53935",
  الأصلي:  "#C0A882",
  ذهبي:   "#D4AF37",
  فضي:    "#C0C0C0",
  بني:    "#795548",
  بيج:    "#F5F0E8",
  رمادي:  "#9E9E9E",
  كحلي:   "#1B2A4A",
  أخضر:   "#4CAF50",
  أصفر:   "#FDD835",
  برتقالي:"#FF7043",
  بنفسجي: "#7E57C2",
  زيتي:   "#6D8B3A",
  كريمي:  "#F5F0DC",
};

export function colorToCss(name: string): string {
  return MAP[name.trim()] ?? "#D0CBC4";
}

export function needsBorder(name: string): boolean {
  const css = colorToCss(name);
  return css === "#FFFFFF" || css === "#F5F0E8" || css === "#F5F0DC";
}
