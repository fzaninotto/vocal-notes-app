import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Home, MapPin, Euro, Ruler, Calendar, Flame, Zap, Info, Building, Trees, Car, Wrench } from "lucide-react"
import { usePropertyUpdates } from "@/hooks/use-property-updates"
import { cn } from "@/lib/utils"

interface PropertyDescriptionProps {
  property: any | null
}

export function PropertyDescription({ property }: PropertyDescriptionProps) {
  const updatedFields = usePropertyUpdates(property)
  if (!property) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Home className="h-5 w-5" />
            Property Description
          </CardTitle>
          <CardDescription>
            Start recording to extract property information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            No property information available yet. Record audio notes describing the property and the system will automatically extract relevant details.
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Home className="h-5 w-5" />
              {property.listingTitle || "Property Description"}
            </CardTitle>
            <CardDescription className="mt-2">
              {property.propertyType && (
                <Badge variant="secondary" className="mr-2">
                  {property.propertyType.replace(/_/g, ' ')}
                </Badge>
              )}
              {property.status && (
                <Badge variant={property.status === 'FOR_SALE' ? 'default' : 'outline'}>
                  {property.status.replace(/_/g, ' ')}
                </Badge>
              )}
            </CardDescription>
          </div>
          {property.price && (
            <div className="text-right">
              <div className="flex items-center gap-1 text-2xl font-bold">
                <Euro className="h-5 w-5" />
                {property.price.amount?.toLocaleString('fr-FR')}
              </div>
              {property.price.includesAgencyFees && (
                <span className="text-xs text-muted-foreground">Agency fees included</span>
              )}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overview Section */}
        <div className="space-y-4">
          {property.description && (
            <div className={cn(
              "rounded-lg p-2 -m-2 transition-all duration-300",
              updatedFields.description && "bg-yellow-100 animate-pulse [animation-iteration-count:2]"
            )}>
              <h3 className="font-semibold mb-2 text-base">Description</h3>
              <p className="text-sm text-muted-foreground">{property.description}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            {property.livingArea && (
              <div className={cn(
                "flex items-center gap-2 rounded-lg p-2 -m-2 transition-all duration-300",
                updatedFields.livingArea && "bg-yellow-100 animate-pulse [animation-iteration-count:2]"
              )}>
                <Ruler className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  <strong>{property.livingArea}</strong> m² living area
                </span>
              </div>
            )}

            {property.totalPlotArea && (
              <div className={cn(
                "flex items-center gap-2 rounded-lg p-2 -m-2 transition-all duration-300",
                updatedFields.totalPlotArea && "bg-yellow-100 animate-pulse [animation-iteration-count:2]"
              )}>
                <Trees className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  <strong>{property.totalPlotArea}</strong> m² plot
                </span>
              </div>
            )}

            {property.yearOfConstruction && (
              <div className={cn(
                "flex items-center gap-2 rounded-lg p-2 -m-2 transition-all duration-300",
                updatedFields.yearOfConstruction && "bg-yellow-100 animate-pulse [animation-iteration-count:2]"
              )}>
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  Built in <strong>{property.yearOfConstruction}</strong>
                </span>
              </div>
            )}

            {property.totalBedrooms !== undefined && (
              <div className={cn(
                "flex items-center gap-2 rounded-lg p-2 -m-2 transition-all duration-300",
                updatedFields.totalBedrooms && "bg-yellow-100 animate-pulse [animation-iteration-count:2]"
              )}>
                <Home className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  <strong>{property.totalBedrooms}</strong> bedrooms
                </span>
              </div>
            )}

            {property.totalBathrooms !== undefined && (
              <div className={cn(
                "flex items-center gap-2 rounded-lg p-2 -m-2 transition-all duration-300",
                updatedFields.totalBathrooms && "bg-yellow-100 animate-pulse [animation-iteration-count:2]"
              )}>
                <Home className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  <strong>{property.totalBathrooms}</strong> bathrooms
                </span>
              </div>
            )}

            {property.overallCondition && (
              <div className={cn(
                "flex items-center gap-2 rounded-lg p-2 -m-2 transition-all duration-300",
                updatedFields.overallCondition && "bg-yellow-100 animate-pulse [animation-iteration-count:2]"
              )}>
                <Info className="h-4 w-4 text-muted-foreground" />
                <Badge variant="outline" className="text-xs">
                  {property.overallCondition.replace(/_/g, ' ')}
                </Badge>
              </div>
            )}
          </div>

          {property.address && (
            <div className={cn(
              "rounded-lg p-2 -m-2 transition-all duration-300",
              updatedFields.address && "bg-yellow-100 animate-pulse [animation-iteration-count:2]"
            )}>
              <h3 className="font-semibold mb-2 flex items-center gap-2 text-base">
                <MapPin className="h-4 w-4" />
                Location
              </h3>
              <p className="text-sm text-muted-foreground">
                {property.address.street && `${property.address.street}, `}
                {property.address.postalCode} {property.address.city}
                {property.address.country && `, ${property.address.country}`}
              </p>
            </div>
          )}
        </div>

        <Separator />

        {/* Property Details Section */}
        <div className={cn(
          "rounded-lg p-3 -m-3 transition-all duration-300",
          updatedFields.propertyDetails && "bg-yellow-100 animate-pulse [animation-iteration-count:2]"
        )}>
          <h3 className="font-semibold mb-3 flex items-center gap-2 text-base">
            <Building className="h-4 w-4" />
            Property Details
          </h3>
          <div className="grid grid-cols-2 gap-y-3 gap-x-6 text-sm">
            {property.numberOfFloorsInBuilding && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total floors</span>
                <span className="font-medium">{property.numberOfFloorsInBuilding}</span>
              </div>
            )}

            {property.propertyFloorLevel !== undefined && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Floor level</span>
                <span className="font-medium">{property.propertyFloorLevel}</span>
              </div>
            )}

            {property.hasElevator !== undefined && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Elevator</span>
                <span className="font-medium">{property.hasElevator ? 'Yes' : 'No'}</span>
              </div>
            )}

            {property.lastRenovationYear && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Last renovation</span>
                <span className="font-medium">{property.lastRenovationYear}</span>
              </div>
            )}

            {property.annualPropertyTax && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Annual tax</span>
                <span className="font-medium">€{property.annualPropertyTax}</span>
              </div>
            )}

            {property.condominiumFees && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Monthly fees</span>
                <span className="font-medium">€{property.condominiumFees}</span>
              </div>
            )}
          </div>
        </div>

        {/* Energy & Heating Section */}
        {(property.heating || property.energyPerformance || property.windows) && (
          <>
            <Separator />
            <div className={cn(
              "rounded-lg p-3 -m-3 transition-all duration-300",
              updatedFields.energy && "bg-yellow-100 animate-pulse [animation-iteration-count:2]"
            )}>
              <h3 className="font-semibold mb-3 flex items-center gap-2 text-base">
                <Flame className="h-4 w-4" />
                Energy & Climate
              </h3>
              <div className="grid grid-cols-2 gap-y-3 gap-x-6 text-sm">
                {property.heating && (
                  <>
                    {property.heating.mainType && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Heating type</span>
                        <Badge variant="outline" className="text-xs">{property.heating.mainType}</Badge>
                      </div>
                    )}
                    {property.heating.distribution && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Distribution</span>
                        <span className="font-medium">{property.heating.distribution.replace(/_/g, ' ')}</span>
                      </div>
                    )}
                    {property.heating.hasAirConditioning !== undefined && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Air conditioning</span>
                        <span className="font-medium">{property.heating.hasAirConditioning ? 'Yes' : 'No'}</span>
                      </div>
                    )}
                  </>
                )}

                {property.energyPerformance && (
                  <>
                    {property.energyPerformance.dpeClass && (
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Energy class (DPE)</span>
                        <Badge 
                          variant="outline" 
                          className={`text-xs
                            ${property.energyPerformance.dpeClass <= 'B' ? 'bg-green-100 text-green-800' : ''}
                            ${property.energyPerformance.dpeClass >= 'E' ? 'bg-red-100 text-red-800' : ''}
                          `}
                        >
                          {property.energyPerformance.dpeClass}
                        </Badge>
                      </div>
                    )}
                    {property.energyPerformance.gesClass && (
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">GES class</span>
                        <Badge 
                          variant="outline" 
                          className={`text-xs
                            ${property.energyPerformance.gesClass <= 'B' ? 'bg-green-100 text-green-800' : ''}
                            ${property.energyPerformance.gesClass >= 'E' ? 'bg-red-100 text-red-800' : ''}
                          `}
                        >
                          {property.energyPerformance.gesClass}
                        </Badge>
                      </div>
                    )}
                    {property.energyPerformance.estimatedAnnualEnergyCost && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Est. annual energy cost</span>
                        <span className="font-medium">€{property.energyPerformance.estimatedAnnualEnergyCost}</span>
                      </div>
                    )}
                  </>
                )}

                {property.windows && (
                  <>
                    {property.windows.glazingType && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Window glazing</span>
                        <span className="font-medium">{property.windows.glazingType} glazing</span>
                      </div>
                    )}
                    {property.windows.frameMaterial && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Window frames</span>
                        <span className="font-medium">{property.windows.frameMaterial}</span>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </>
        )}

        {/* Rooms Section */}
        {property.rooms && property.rooms.length > 0 && (
          <>
            <Separator />
            <div className={cn(
              "rounded-lg p-3 -m-3 transition-all duration-300",
              updatedFields.rooms && "bg-yellow-100 animate-pulse [animation-iteration-count:2]"
            )}>
              <h3 className="font-semibold mb-3 flex items-center gap-2 text-base">
                <Home className="h-4 w-4" />
                Rooms ({property.rooms.length})
              </h3>
              <div className="grid grid-cols-1 gap-3">
                {property.rooms.map((room: any, index: number) => (
                  <div key={index} className={cn(
                    "border rounded-lg p-3 transition-all duration-300",
                    updatedFields[`room-${index}`] ? "bg-yellow-200 animate-pulse [animation-iteration-count:2]" : "bg-muted/30"
                  )}>
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <Badge className="text-xs">{room.type.replace(/_/g, ' ')}</Badge>
                        {room.surface && <span className="text-sm font-medium">{room.surface} m²</span>}
                      </div>
                      {room.floorLevel !== undefined && (
                        <span className="text-xs text-muted-foreground">Floor {room.floorLevel}</span>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                      {room.floorCovering && (
                        <div>Flooring: {room.floorCovering.toLowerCase()}</div>
                      )}
                      {room.exposition && room.exposition.length > 0 && (
                        <div>Facing: {room.exposition.join(', ').toLowerCase()}</div>
                      )}
                    </div>
                    {room.features && room.features.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {room.features.map((feature: string, idx: number) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Kitchen Section */}
        {property.kitchen && (
          <>
            <Separator />
            <div className={cn(
              "rounded-lg p-3 -m-3 transition-all duration-300",
              updatedFields.kitchen && "bg-yellow-100 animate-pulse [animation-iteration-count:2]"
            )}>
              <h3 className="font-semibold mb-3 flex items-center gap-2 text-base">
                <Wrench className="h-4 w-4" />
                Kitchen
              </h3>
              <div className="grid grid-cols-2 gap-y-3 gap-x-6 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Equipped</span>
                  <span className="font-medium">{property.kitchen.isEquipped ? 'Yes' : 'No'}</span>
                </div>
                {property.kitchen.type && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Type</span>
                    <span className="font-medium">{property.kitchen.type.replace(/_/g, ' ')}</span>
                  </div>
                )}
              </div>
              {property.kitchen.appliances && property.kitchen.appliances.length > 0 && (
                <div className="mt-3">
                  <span className="text-sm text-muted-foreground">Appliances:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {property.kitchen.appliances.map((appliance: string, index: number) => (
                      <Badge key={index} variant="secondary" className="text-xs">{appliance}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* Outdoor Spaces Section */}
        {property.outdoorSpaces && property.outdoorSpaces.length > 0 && (
          <>
            <Separator />
            <div className={cn(
              "rounded-lg p-3 -m-3 transition-all duration-300",
              updatedFields.outdoorSpaces && "bg-yellow-100 animate-pulse [animation-iteration-count:2]"
            )}>
              <h3 className="font-semibold mb-3 flex items-center gap-2 text-base">
                <Trees className="h-4 w-4" />
                Outdoor Spaces
              </h3>
              <div className="grid grid-cols-1 gap-3">
                {property.outdoorSpaces.map((space: any, index: number) => (
                  <div key={index} className="border rounded-lg p-3 bg-muted/30">
                    <div className="flex justify-between items-start mb-2">
                      <Badge className="text-xs">{space.type}</Badge>
                      <span className="text-sm font-medium">{space.surface} m²</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                      {space.isFenced !== undefined && (
                        <div>Fenced: {space.isFenced ? 'Yes' : 'No'}</div>
                      )}
                      {space.hasPool !== undefined && (
                        <div>Pool: {space.hasPool ? 'Yes' : 'No'}</div>
                      )}
                      {space.poolDimensions && (
                        <div>Pool size: {space.poolDimensions}</div>
                      )}
                      {space.orientation && space.orientation.length > 0 && (
                        <div>Orientation: {space.orientation.join(', ').toLowerCase()}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Parking Section */}
        {property.parking && property.parking.hasParking && (
          <>
            <Separator />
            <div className={cn(
              "rounded-lg p-3 -m-3 transition-all duration-300",
              updatedFields.parking && "bg-yellow-100 animate-pulse [animation-iteration-count:2]"
            )}>
              <h3 className="font-semibold mb-3 flex items-center gap-2 text-base">
                <Car className="h-4 w-4" />
                Parking
              </h3>
              <div className="grid grid-cols-2 gap-y-3 gap-x-6 text-sm">
                {property.parking.type && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Type</span>
                    <span className="font-medium">{property.parking.type.replace(/_/g, ' ')}</span>
                  </div>
                )}
                {property.parking.numberOfSpaces && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Spaces</span>
                    <span className="font-medium">{property.parking.numberOfSpaces}</span>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* Additional Features Section */}
        {((property.amenities && property.amenities.length > 0) || property.hasCellar) && (
          <>
            <Separator />
            <div className={cn(
              "rounded-lg p-3 -m-3 transition-all duration-300",
              (updatedFields.amenities || updatedFields.additionalFeatures) && "bg-yellow-100 animate-pulse [animation-iteration-count:2]"
            )}>
              <h3 className="font-semibold mb-3 text-base">Additional Features</h3>
              {property.amenities && property.amenities.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {property.amenities.map((amenity: string, index: number) => (
                    <Badge key={index} variant="secondary">{amenity}</Badge>
                  ))}
                </div>
              )}
              {property.hasCellar && (
                <div className="flex items-center gap-2 text-sm">
                  <Info className="h-4 w-4 text-muted-foreground" />
                  <span>Includes cellar storage</span>
                </div>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}