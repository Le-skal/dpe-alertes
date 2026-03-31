'use client'

import { useState, useEffect, useRef } from 'react'

interface City {
  nom: string
  codesPostaux: string[]
}

interface CityAutocompleteProps {
  onSelect: (cityWithDept: string) => void  // Format: "Lyon|69"
  selectedCities: string[]  // Format: ["Lyon|69", "Paris|75"]
}

// Helper pour parser le format "Ville|Dept"
export function parseCityDept(value: string): { nom: string; dept: string } {
  const parts = value.split('|')
  return { nom: parts[0], dept: parts[1] || '' }
}

// Helper pour formater l'affichage
export function formatCityDisplay(value: string): string {
  const { nom, dept } = parseCityDept(value)
  return dept ? `${nom} (${dept})` : nom
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
        const trimmedQuery = query.trim()

        // Détecter si c'est un code postal (5 chiffres)
        const isPostalCode = /^\d{5}$/.test(trimmedQuery)
        // Détecter si c'est un numéro de département (2 ou 3 chiffres, ou 2A/2B pour la Corse)
        const isDeptSearch = /^(\d{2,3}|2[aAbB])$/.test(trimmedQuery)

        let data: City[] = []

        if (isPostalCode) {
          // Recherche par code postal exact
          const res = await fetch(
            `https://geo.api.gouv.fr/communes?codePostal=${trimmedQuery}&fields=nom,codesPostaux`,
            { signal: controller.signal }
          )
          if (res.ok) {
            data = await res.json()
          }
        } else if (isDeptSearch) {
          // Recherche par département - récupérer toutes les communes
          const dept = trimmedQuery.toUpperCase()
          const res = await fetch(
            `https://geo.api.gouv.fr/departements/${dept}/communes?fields=nom,codesPostaux`,
            { signal: controller.signal }
          )
          if (res.ok) {
            data = await res.json()
            // Trier par le plus petit code postal de chaque commune
            data = data
              .map(city => ({
                ...city,
                minCP: Math.min(...city.codesPostaux.map(cp => parseInt(cp) || 99999))
              }))
              .sort((a, b) => (a as City & { minCP: number }).minCP - (b as City & { minCP: number }).minCP)
              .slice(0, 20)
          }
        } else {
          // Recherche par nom de ville
          const res = await fetch(
            `https://geo.api.gouv.fr/communes?nom=${encodeURIComponent(trimmedQuery)}&fields=nom,codesPostaux&boost=population&limit=8`,
            { signal: controller.signal }
          )
          if (res.ok) {
            data = await res.json()
          }
        }

        // Filter out already selected cities (check by city name)
        const selectedNames = selectedCities.map(c => parseCityDept(c).nom)
        const filtered = data.filter(
          (city) => !selectedNames.includes(city.nom)
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
    // Extraire le département (2 premiers chiffres du code postal)
    const codePostal = city.codesPostaux[0] || ''
    const dept = codePostal.substring(0, 2)
    // Stocker en format "Ville|Dept"
    onSelect(`${city.nom}|${dept}`)
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
