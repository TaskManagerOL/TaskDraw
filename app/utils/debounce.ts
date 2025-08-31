function debounce<T extends (...args: never[]) => unknown>(
  fn: T,
  time: number
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout> | null = null;
  const wapper = (...args: Parameters<T>) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => fn(...args), time);
  };
  wapper.cancel = () => clearTimeout(timer);
  return wapper;
}

export default debounce;