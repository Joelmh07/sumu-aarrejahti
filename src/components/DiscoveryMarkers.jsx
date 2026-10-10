import { useMemo } from 'react'
import { Marker, Tooltip } from 'react-leaflet'
import L from 'leaflet'
import locations from '../data/locations.json'
import categories from '../data/categories.json'

function makeIcon(loc, status) {
  const color = categories[loc.category]?.color ?? '#e9c46a'
  const badge =
    status === 'correct' ? '<span class="pin-badge ok">✓</span>' :
    status === 'wrong' ? '<span class="pin-badge done">•</span>' :
    '<span class="pin-badge new">!</span>'
  return L.divIcon({
    className: '',
    iconSize: [52, 52],
    iconAnchor: [26, 26],
    html: `
      <div class="pin ${status ? 'pin-done' : 'pin-new'} ${loc.rarity === 'legendaarinen' ? 'pin-legend' : ''}" style="--pin:${color}">
        <span class="pin-ring"></span>
        <span class="pin-core">${loc.emoji}</span>
        ${badge}
      </div>`,
  })
}

export default function DiscoveryMarkers({ discovered, onSelect }) {
  const visible = useMemo(() => locations.filter((l) => discovered[l.id]), [discovered])
  return visible.map((loc) => {
    const status = discovered[loc.id].quiz
    return (
      <Marker
        key={`${loc.id}-${status ?? 'new'}`}
        position={[loc.lat, loc.lng]}
        icon={makeIcon(loc, status)}
        eventHandlers={{ click: () => onSelect(loc) }}
      >
        <Tooltip direction="top" offset={[0, -24]} className="pin-tooltip">
          {loc.name}
        </Tooltip>
      </Marker>
    )
  })
}
