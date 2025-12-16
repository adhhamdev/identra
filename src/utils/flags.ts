export function getFlagUrl(code?: string) {
  if (!code) {
    return "https://flagcdn.com/w320/us.png";
  }
  return `https://flagcdn.com/w320/${code.toLowerCase()}.png`;
}
