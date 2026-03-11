'use client'

import { useState } from 'react'
import { Search } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface SearchBarProps {
  placeholder?: string
  className?: string
}

export default function SearchBar({ 
  placeholder = 'Search by business name or category...', 
  className = '' 
}: SearchBarProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const router = useRouter()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`)
    }
  }

  const handleCategoryClick = (category: string) => {
    router.push(`/search?category=${encodeURIComponent(category)}`)
  }

  return (
    <div className={`w-full ${className}`}>
      <form onSubmit={handleSearch} className="flex flex-col gap-4">
        {/* Main Search Bar */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="w-5 h-5 text-indigo-400" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={placeholder}
            className="w-full pl-12 pr-4 py-4 rounded-lg border-2 border-indigo-200 focus:border-indigo-600 focus:outline-none transition-all bg-white text-slate-900 placeholder-slate-500 shadow-lg"
          />
          <button
            type="submit"
            className="absolute inset-y-0 right-3 px-4 py-2 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white font-semibold rounded-md hover:shadow-lg transition-all"
          >
            Search
          </button>
        </div>

        {/* Quick Category Filters */}
        <div className="flex flex-wrap gap-2">
          {[
            { label: 'Hair Salon', value: 'HAIR_SALON' },
            { label: 'Clinic', value: 'CLINIC' },
            { label: 'Spa', value: 'SPA_MASSAGE' },
          ].map((category) => (
            <button
              key={category.value}
              type="button"
              onClick={() => handleCategoryClick(category.value)}
              className="px-4 py-2 bg-indigo-100 text-indigo-700 font-medium rounded-lg hover:bg-indigo-200 transition-colors text-sm"
            >
              {category.label}
            </button>
          ))}
        </div>
      </form>
    </div>
  )
}
