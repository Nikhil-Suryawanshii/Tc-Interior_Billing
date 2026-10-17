export function recordId(record) {
  const id = record?.id || record?._id;
  return id ? String(id) : '';
}
