export function ok<TData>(data: TData, meta?: Record<string, unknown>) {
  return { success: true, data, meta: meta ?? {} };
}
