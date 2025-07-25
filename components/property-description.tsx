import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Home, MapPin, Euro, Ruler, Calendar, Flame, Zap, Info } from "lucide-react"

interface PropertyDescriptionProps {
  property: any | null
}

export function PropertyDescription({ property }: PropertyDescriptionProps) {
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
      <CardContent>
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="rooms">Rooms</TabsTrigger>
            <TabsTrigger value="features">Features</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            {property.description && (
              <div>
                <h3 className="font-semibold mb-2">Description</h3>
                <p className="text-sm text-muted-foreground">{property.description}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              {property.livingArea && (
                <div className="flex items-center gap-2">
                  <Ruler className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    <strong>{property.livingArea}</strong> m² living area
                  </span>
                </div>
              )}

              {property.totalPlotArea && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    <strong>{property.totalPlotArea}</strong> m² plot
                  </span>
                </div>
              )}

              {property.yearOfConstruction && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    Built in <strong>{property.yearOfConstruction}</strong>
                  </span>
                </div>
              )}

              {property.totalBedrooms !== undefined && (
                <div className="flex items-center gap-2">
                  <Home className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    <strong>{property.totalBedrooms}</strong> bedrooms
                  </span>
                </div>
              )}
            </div>

            {property.address && (
              <div>
                <h3 className="font-semibold mb-2 flex items-center gap-2">
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
          </TabsContent>

          <TabsContent value="details" className="space-y-4">
            <ScrollArea className="h-[300px]">
              <div className="space-y-3">
                {property.overallCondition && (
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Condition</span>
                    <Badge variant="outline">{property.overallCondition.replace(/_/g, ' ')}</Badge>
                  </div>
                )}

                {property.numberOfFloorsInBuilding && (
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Total floors</span>
                    <span className="text-sm font-medium">{property.numberOfFloorsInBuilding}</span>
                  </div>
                )}

                {property.propertyFloorLevel !== undefined && (
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Floor level</span>
                    <span className="text-sm font-medium">{property.propertyFloorLevel}</span>
                  </div>
                )}

                {property.hasElevator !== undefined && (
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Elevator</span>
                    <span className="text-sm font-medium">{property.hasElevator ? 'Yes' : 'No'}</span>
                  </div>
                )}

                {property.heating && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Heating type</span>
                      <Badge variant="outline">{property.heating.mainType}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Air conditioning</span>
                      <span className="text-sm font-medium">
                        {property.heating.hasAirConditioning ? 'Yes' : 'No'}
                      </span>
                    </div>
                  </>
                )}

                {property.energyPerformance && (
                  <>
                    {property.energyPerformance.dpeClass && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground flex items-center gap-1">
                          <Zap className="h-3 w-3" />
                          Energy class
                        </span>
                        <Badge 
                          variant="outline" 
                          className={`
                            ${property.energyPerformance.dpeClass <= 'B' ? 'bg-green-100 text-green-800' : ''}
                            ${property.energyPerformance.dpeClass >= 'E' ? 'bg-red-100 text-red-800' : ''}
                          `}
                        >
                          {property.energyPerformance.dpeClass}
                        </Badge>
                      </div>
                    )}
                  </>
                )}

                {property.annualPropertyTax && (
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Annual property tax</span>
                    <span className="text-sm font-medium">€{property.annualPropertyTax}</span>
                  </div>
                )}

                {property.condominiumFees && (
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Monthly fees</span>
                    <span className="text-sm font-medium">€{property.condominiumFees}</span>
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="rooms" className="space-y-4">
            <ScrollArea className="h-[300px]">
              {property.rooms && property.rooms.length > 0 ? (
                <div className="space-y-3">
                  {property.rooms.map((room: any, index: number) => (
                    <div key={index} className="border rounded-lg p-3">
                      <div className="flex justify-between items-start mb-2">
                        <Badge>{room.type.replace(/_/g, ' ')}</Badge>
                        <span className="text-sm font-medium">{room.surface} m²</span>
                      </div>
                      <div className="text-xs text-muted-foreground space-y-1">
                        <div>Floor: {room.floorLevel}</div>
                        {room.floorCovering && <div>Flooring: {room.floorCovering}</div>}
                        {room.exposition && room.exposition.length > 0 && (
                          <div>Facing: {room.exposition.join(', ')}</div>
                        )}
                        {room.features && room.features.length > 0 && (
                          <div>Features: {room.features.join(', ')}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No room details available yet
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="features" className="space-y-4">
            <ScrollArea className="h-[300px]">
              <div className="space-y-4">
                {property.kitchen && (
                  <div>
                    <h4 className="font-semibold mb-2">Kitchen</h4>
                    <div className="space-y-1 text-sm">
                      <div>Equipped: {property.kitchen.isEquipped ? 'Yes' : 'No'}</div>
                      {property.kitchen.type && <div>Type: {property.kitchen.type.replace(/_/g, ' ')}</div>}
                      {property.kitchen.appliances && property.kitchen.appliances.length > 0 && (
                        <div>Appliances: {property.kitchen.appliances.join(', ')}</div>
                      )}
                    </div>
                  </div>
                )}

                {property.parking && property.parking.hasParking && (
                  <div>
                    <h4 className="font-semibold mb-2">Parking</h4>
                    <div className="space-y-1 text-sm">
                      {property.parking.type && <div>Type: {property.parking.type.replace(/_/g, ' ')}</div>}
                      {property.parking.numberOfSpaces && <div>Spaces: {property.parking.numberOfSpaces}</div>}
                    </div>
                  </div>
                )}

                {property.outdoorSpaces && property.outdoorSpaces.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">Outdoor Spaces</h4>
                    <div className="space-y-2">
                      {property.outdoorSpaces.map((space: any, index: number) => (
                        <div key={index} className="text-sm">
                          <Badge variant="outline" className="mb-1">{space.type}</Badge>
                          <div className="ml-2 space-y-1 text-xs text-muted-foreground">
                            <div>Area: {space.surface} m²</div>
                            {space.hasPool && <div>Swimming pool: Yes</div>}
                            {space.isFenced && <div>Fenced: Yes</div>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {property.amenities && property.amenities.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">Amenities</h4>
                    <div className="flex flex-wrap gap-2">
                      {property.amenities.map((amenity: string, index: number) => (
                        <Badge key={index} variant="secondary">{amenity}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {property.hasCellar && (
                  <div className="flex items-center gap-2">
                    <Info className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Includes cellar storage</span>
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}