import type { ProductSearchResult } from '../../services/api'

export type ProductSuggestion = {
  productId: string
  productName: string
  sku: string | null
  brand: string | null
  locations: ProductSearchResult['location'][]
}

export async function searchSuggestions(query: string, layoutId: string | undefined, signal: AbortSignal): Promise<ProductSuggestion[]> {
  const params = new URLSearchParams({ query })
  if (layoutId) params.set('layoutId', layoutId)
  const response = await fetch('/api/search/suggestions?' + params, { signal })
  if (!response.ok) throw new Error('Não foi possível buscar os produtos. Confira a conexão com o backend.')
  return response.json() as Promise<ProductSuggestion[]>
}