export function nonNullFilter<T>(v: T | null | undefined): v is T {
    return v != null;
}