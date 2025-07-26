import { useEffect, useRef, useState } from 'react'

interface UpdatedFields {
  [key: string]: boolean
}

export function usePropertyUpdates(property: any) {
  const [updatedFields, setUpdatedFields] = useState<UpdatedFields>({})
  const previousPropertyRef = useRef<any>(null)
  
  useEffect(() => {
    if (!property || !previousPropertyRef.current) {
      previousPropertyRef.current = property
      return
    }
    
    const newUpdates: UpdatedFields = {}
    
    // Helper function to deep compare objects
    const hasChanged = (path: string, oldVal: any, newVal: any): boolean => {
      if (oldVal === newVal) return false
      if (!oldVal && newVal) return true
      if (oldVal && !newVal) return false
      
      // For arrays, check if length changed or items are different
      if (Array.isArray(oldVal) && Array.isArray(newVal)) {
        if (oldVal.length !== newVal.length) return true
        // For rooms, check if any room was added or modified
        if (path === 'rooms') {
          return newVal.length > oldVal.length || 
            newVal.some((room: any, idx: number) => 
              JSON.stringify(room) !== JSON.stringify(oldVal[idx])
            )
        }
        return JSON.stringify(oldVal) !== JSON.stringify(newVal)
      }
      
      // For objects, check if any property changed
      if (typeof oldVal === 'object' && typeof newVal === 'object') {
        return JSON.stringify(oldVal) !== JSON.stringify(newVal)
      }
      
      return oldVal !== newVal
    }
    
    const prev = previousPropertyRef.current
    
    // Check main fields
    if (hasChanged('description', prev.description, property.description)) {
      newUpdates.description = true
    }
    
    if (hasChanged('livingArea', prev.livingArea, property.livingArea)) {
      newUpdates.livingArea = true
    }
    
    if (hasChanged('totalPlotArea', prev.totalPlotArea, property.totalPlotArea)) {
      newUpdates.totalPlotArea = true
    }
    
    if (hasChanged('yearOfConstruction', prev.yearOfConstruction, property.yearOfConstruction)) {
      newUpdates.yearOfConstruction = true
    }
    
    if (hasChanged('totalBedrooms', prev.totalBedrooms, property.totalBedrooms)) {
      newUpdates.totalBedrooms = true
    }
    
    if (hasChanged('totalBathrooms', prev.totalBathrooms, property.totalBathrooms)) {
      newUpdates.totalBathrooms = true
    }
    
    if (hasChanged('overallCondition', prev.overallCondition, property.overallCondition)) {
      newUpdates.overallCondition = true
    }
    
    if (hasChanged('address', prev.address, property.address)) {
      newUpdates.address = true
    }
    
    // Check property details
    if (hasChanged('numberOfFloorsInBuilding', prev.numberOfFloorsInBuilding, property.numberOfFloorsInBuilding)) {
      newUpdates.propertyDetails = true
    }
    
    if (hasChanged('propertyFloorLevel', prev.propertyFloorLevel, property.propertyFloorLevel)) {
      newUpdates.propertyDetails = true
    }
    
    if (hasChanged('hasElevator', prev.hasElevator, property.hasElevator)) {
      newUpdates.propertyDetails = true
    }
    
    if (hasChanged('lastRenovationYear', prev.lastRenovationYear, property.lastRenovationYear)) {
      newUpdates.propertyDetails = true
    }
    
    if (hasChanged('annualPropertyTax', prev.annualPropertyTax, property.annualPropertyTax)) {
      newUpdates.propertyDetails = true
    }
    
    if (hasChanged('condominiumFees', prev.condominiumFees, property.condominiumFees)) {
      newUpdates.propertyDetails = true
    }
    
    // Check energy & heating
    if (hasChanged('heating', prev.heating, property.heating)) {
      newUpdates.energy = true
    }
    
    if (hasChanged('energyPerformance', prev.energyPerformance, property.energyPerformance)) {
      newUpdates.energy = true
    }
    
    if (hasChanged('windows', prev.windows, property.windows)) {
      newUpdates.energy = true
    }
    
    // Check rooms
    if (hasChanged('rooms', prev.rooms, property.rooms)) {
      newUpdates.rooms = true
      // Also track which specific rooms were updated
      if (property.rooms && prev.rooms) {
        property.rooms.forEach((room: any, idx: number) => {
          if (!prev.rooms[idx] || JSON.stringify(room) !== JSON.stringify(prev.rooms[idx])) {
            newUpdates[`room-${idx}`] = true
          }
        })
      }
    }
    
    // Check kitchen
    if (hasChanged('kitchen', prev.kitchen, property.kitchen)) {
      newUpdates.kitchen = true
    }
    
    // Check outdoor spaces
    if (hasChanged('outdoorSpaces', prev.outdoorSpaces, property.outdoorSpaces)) {
      newUpdates.outdoorSpaces = true
    }
    
    // Check parking
    if (hasChanged('parking', prev.parking, property.parking)) {
      newUpdates.parking = true
    }
    
    // Check amenities
    if (hasChanged('amenities', prev.amenities, property.amenities)) {
      newUpdates.amenities = true
    }
    
    if (hasChanged('hasCellar', prev.hasCellar, property.hasCellar)) {
      newUpdates.additionalFeatures = true
    }
    
    // Set the updated fields
    setUpdatedFields(newUpdates)
    
    // Clear highlights after 3 seconds
    const timer = setTimeout(() => {
      setUpdatedFields({})
    }, 3000)
    
    // Update the reference
    previousPropertyRef.current = property
    
    return () => clearTimeout(timer)
  }, [property])
  
  return updatedFields
}