function debounce<T extends (...args: never[]) => unknown>(
  fn: T,
  time: number
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout> | null = null;
  return function (...args: Parameters<T>) {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => fn(...args), time);
  };
}

export default debounce;