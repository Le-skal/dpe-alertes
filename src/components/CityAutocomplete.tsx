'use client'

import { useState, useEffect, useRef } from 'react'

interface City {
  nom: string
  codesPostaux: string[]
}

interface CityAutocompleteProps {
  onSelect: (city: string) => void
  selectedCities: string[]
}

export function CityAutocomplete({ onSelect, selectedCities }: CityAutocompleteProps) {
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState<City[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Fetch cities from API
  useEffect(() => {
    if (query.length < 2) {
      setSuggestions([])
      return
    }

    const controller = new AbortController()
    setLoading(true)

    const fetchCities = async () => {
      try {
        const res = await fetch(
          `https://geo.api.gouv.fr/communes?nom=${encodeURIComponent(query)}&fields=nom,codesPostaux&boost=population&limit=8`,
          { signal: controller.signal }
        )
        const data: City[] = await res.json()
        // Filter out already selected cities
        const filtered = data.filter(
          (city) => !selectedCities.includes(city.nom)
        )
        setSuggestions(filtered)
        setIsOpen(filtered.length > 0)
        setHighlightedIndex(-1)
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          console.error('Error fetching cities:', error)
        }
      } finally {
        setLoading(false)
      }
    }

    const debounce = setTimeout(fetchCities, 200)

    return () => {
      clearTimeout(debounce)
      controller.abort()
    }
  }, [query, selectedCities])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelect = (city: City) => {
    onSelect(city.nom)
    setQuery('')
    setSuggestions([])
    setIsOpen(false)
    inputRef.current?.focus()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setHighlightedIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : prev
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : -1))
        break
      case 'Enter':
        e.preventDefault()
        if (highlightedIndex >= 0 && suggestions[highlightedIndex]) {
          handleSelect(suggestions[highlightedIndex])
        }
        break
      case 'Escape':
        setIsOpen(false)
        setHighlightedIndex(-1)
        break
    }
  }

  return (
    <div ref={wrapperRef} className="relative">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => suggestions.length > 0 && setIsOpen(true)}
          onKeyDown={handleKeyDown}
          className="input-stitch w-full px-4 py-3 rounded-xl text-[var(--on-surface)] pr-10"
          placeholder="Rechercher une ville..."
        />
        {loading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="w-5 h-5 border-2 border-[var(--primary-fixed)] border-t-[var(--primary)] rounded-full animate-spin" />
          </div>
        )}
        {!loading && query.length >= 2 && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <svg className="w-5 h-5 text-[var(--on-surface-variant)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        )}
      </div>

      {/* Dropdown */}
      {isOpen && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-2 bg-[var(--surface-container-lowest)] rounded-xl ambient-shadow overflow-hidden">
          <ul className="py-2 max-h-64 overflow-y-auto custom-scrollbar">
            {suggestions.map((city, index) => (
              <li key={`${city.nom}-${city.codesPostaux[0]}`}>
                <button
                  type="button"
                  onClick={() => handleSelect(city)}
                  onMouseEnter={() => setHighlightedIndex(index)}
                  className={`w-full px-4 py-3 text-left flex items-center justify-between transition-colors ${
                    index === highlightedIndex
                      ? 'bg-[var(--primary-fixed)]'
                      : 'hover:bg-[var(--surface-container)]'
                  }`}
                >
                  <span className="body-md text-[var(--on-surface)]">{city.nom}</span>
                  <span className="label-md text-[var(--on-surface-variant)]">
                    {city.codesPostaux[0]}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* No results */}
      {isOpen && query.length >= 2 && !loading && suggestions.length === 0 && (
        <div className="absolute z-50 w-full mt-2 bg-[var(--surface-container-lowest)] rounded-xl ambient-shadow p-4">
          <p className="body-md text-[var(--on-surface-variant)] text-center">
            Aucune ville trouvée
          </p>
        </div>
      )}
    </div>
  )
}
