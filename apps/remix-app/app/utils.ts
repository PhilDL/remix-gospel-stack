export function nameInitials(name: string) {
  const initials = name.split(" ").map((word) => word[0]);
  return initials.length === 1
    ? initials[0]
    : `${initials[0]}${initials[initials.length - 1]}`;
}
