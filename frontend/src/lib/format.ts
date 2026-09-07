export function formatDate(value: string | null) {
  if (!value) return 'Sem validade'
  return new Intl.DateTimeFormat('pt-BR').format(new Date(`${value}T00:00:00`))
}
