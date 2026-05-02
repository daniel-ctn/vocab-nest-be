export const toDateOnly = (date = new Date()) => {
  const utc = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  return utc
}

export const toIsoDate = (date: Date) => date.toISOString().slice(0, 10)

export const daysBetween = (from: Date, to: Date) => {
  const millis = toDateOnly(to).getTime() - toDateOnly(from).getTime()
  return Math.floor(millis / 86_400_000)
}
