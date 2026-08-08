const modules = import.meta.glob('../assets/char_icons/*.png', { eager: true, import: 'default' });
const iconMap: Record<string, string> = {};
for (const [path, url] of Object.entries(modules)) {
  const match = /icon_char(\d+|unknown)\.png$/.exec(path);
  if (match) iconMap[match[1]] = url as string;
}
export default iconMap;
