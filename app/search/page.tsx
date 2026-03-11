import { Suspense } from 'react'
import Link from 'next/link'
import { getAllBusinesses } from '@/lib/actions'
import { getUserFromRequest } from '@/lib/auth'
import BusinessCardNew from '@/components/BusinessCardNew'

interface SearchPageProps {
  searchParams: Promise<{
    q?: string
    category?: string
  }>
}

const CATEGORY_MAP: Record<string, 'HAIR_SALON' | 'CLINIC' | 'SPA_MASSAGE'> = {
  HAIR_SALON: 'HAIR_SALON',
  HAIRSALON: 'HAIR_SALON',
  'HAIR SALON': 'HAIR_SALON',
  CLINIC: 'CLINIC',
  SPA_MASSAGE: 'SPA_MASSAGE',
  SPAMASSAGE: 'SPA_MASSAGE',
  'SPA MASSAGE': 'SPA_MASSAGE',
  SPA: 'SPA_MASSAGE',
}

function normalizeCategory(category?: string) {
  if (!category) return undefined
  const key = category.trim().toUpperCase().replace(/[-_]+/g, ' ').replace(/\s+/g, ' ')
  return CATEGORY_MAP[key] || CATEGORY_MAP[key.replace(/\s/g, '')]
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q: query, category } = await searchParams
  const normalizedCategory = normalizeCategory(category)
  const user = await getUserFromRequest()

  const businessResult = await getAllBusinesses()
  const allBusinesses = businessResult.success ? (businessResult.businesses ?? []) : []

  // Filter businesses based on search query and category
  let filteredBusinesses = allBusinesses.filter((business: any) => {
    // Filter by category
    if (normalizedCategory && business.industryType !== normalizedCategory) {
      return false
    }

    // Filter by search query (name, description, address)
    if (query) {
      const searchTerm = query.toLowerCase()
      return (
        business.name?.toLowerCase().includes(searchTerm) ||
        business.description?.toLowerCase().includes(searchTerm) ||
        business.address?.toLowerCase().includes(searchTerm)
      )
    }

    return true
  })

  // Map category enum to Vietnamese names
  const getCategoryName = (type: string) => {
    switch (type) {
      case 'HAIR_SALON':
        return 'Hair Salon'
      case 'CLINIC':
        return 'Clinic'
      case 'SPA_MASSAGE':
        return 'Spa & Massage'
      default:
        return type
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-12">
          <Link href="/" className="text-indigo-600 hover:text-indigo-700 font-medium mb-4 inline-block">
            ← Quay lại
          </Link>

          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
            {query
              ? `Kết quả tìm kiếm: "${query}"`
              : normalizedCategory
                ? `Tất cả ${getCategoryName(normalizedCategory)}`
                : 'Tất cả Dịch Vụ'}
          </h1>

          <div className="flex flex-wrap gap-3">
            {normalizedCategory && (
              <span className="inline-flex items-center gap-2 bg-indigo-100 text-indigo-700 px-4 py-2 rounded-lg">
                Loại hình: {getCategoryName(normalizedCategory)}
                <Link
                  href="/search"
                  className="ml-2 hover:text-indigo-900 font-semibold"
                  title="Clear filter"
                >
                  ✕
                </Link>
              </span>
            )}
            <span className="text-slate-600 font-medium">
              {filteredBusinesses.length} kết quả
            </span>
          </div>
        </div>

        {/* Results */}
        {filteredBusinesses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredBusinesses.map((business: any, index: number) => (
              <BusinessCardNew
                key={business.id}
                business={business}
                index={index}
                userLoggedIn={!!user}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">
              Không tìm thấy kết quả
            </h2>
            <p className="text-slate-600 mb-6 max-w-md mx-auto">
              {query
                ? `Rất tiếc, chúng tôi không tìm thấy dịch vụ nào khớp với tìm kiếm "${query}".`
                : 'Rất tiếc, chúng tôi không tìm thấy dịch vụ nào.'}
            </p>
            <Link
              href="/"
              className="inline-block px-6 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Quay lại Trang Chủ
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
