// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function hasDocProperty(obj: any): obj is { _doc: any } {
  return obj && typeof obj === 'object' && '_doc' in obj;
}
