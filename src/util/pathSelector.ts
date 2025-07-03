
export function pathSelector(item: { path: string; }) { return item.path; }

export const pick = (name: string) => (item: { [name]: string }) => item[name]; 
