export default function (input: string): string[] {
  const regex = /[^\s;]+/g;

  return input.match(regex) ?? [];
}
