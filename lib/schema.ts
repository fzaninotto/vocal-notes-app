import { z } from 'zod';

// =============================================================================
// ENUMS & REUSABLE TYPES
// =============================================================================

const PropertyTypeEnum = z.enum([
  'APARTMENT', 
  'HOUSE', 
  'PENTHOUSE', 
  'LOFT', 
  'VILLA', 
  'MANSION', 
  'TOWNHOUSE',
  'STUDIO'
]).describe("The general category of the property.");

const PropertyStatusEnum = z.enum([
  'FOR_SALE', 
  'UNDER_OFFER', 
  'SOLD', 
  'RENTED', 
  'DRAFT'
]).describe("The current sales status of the listing.");

const RoomTypeEnum = z.enum([
  'LIVING_ROOM', 
  'DINING_ROOM', 
  'KITCHEN', 
  'BEDROOM', 
  'BATHROOM', 
  'SHOWER_ROOM', 
  'OFFICE', 
  'LAUNDRY_ROOM', 
  'STORAGE_ROOM', 
  'HALLWAY', 
  'WC', 
  'WALK_IN_CLOSET',
  'UTILITY_ROOM',
  'OTHER'
]).describe("The primary function of a room.");

const FloorCoveringEnum = z.enum([
  'HARDWOOD', 
  'LAMINATE', 
  'TILE', 
  'CARPET', 
  'VINYL', 
  'CONCRETE', 
  'MARBLE', 
  'STONE', 
  'OTHER'
]).describe("The material covering the floor.");

const ExpositionEnum = z.enum([
  'NORTH', 
  'SOUTH', 
  'EAST', 
  'WEST', 
  'NORTH_EAST', 
  'NORTH_WEST', 
  'SOUTH_EAST', 
  'SOUTH_WEST'
]).describe("Cardinal direction for sunlight exposure.");

const HeatingTypeEnum = z.enum([
  'GAS', 
  'ELECTRIC', 
  'OIL', 
  'HEAT_PUMP', 
  'SOLAR', 
  'WOOD', 
  'DISTRICT_HEATING'
]).describe("The primary source of heating.");

const EnergyClassEnum = z.enum(['A', 'B', 'C', 'D', 'E', 'F', 'G']).describe("Energy performance rating from A (best) to G (worst).");

const ConditionEnum = z.enum([
  'NEW_CONSTRUCTION', 
  'EXCELLENT', 
  'GOOD', 
  'NEEDS_REFRESHMENT', 
  'TO_RENOVATE'
]).describe("The overall condition of the property or a specific part of it.");


// =============================================================================
// SUB-SCHEMAS (COMPONENTS OF THE MAIN SCHEMA)
// =============================================================================

const AddressSchema = z.object({
  street: z.string().describe("Street name and number."),
  postalCode: z.string().max(10).describe("Postal code, e.g., '75001'."),
  city: z.string().describe("City name."),
  country: z.string().default('France').describe("Country."),
  latitude: z.number().min(-90).max(90).optional().describe("GPS Latitude for mapping."),
  longitude: z.number().min(-180).max(180).optional().describe("GPS Longitude for mapping."),
});

const RoomSchema = z.object({
  type: RoomTypeEnum.describe("The function of the room."),
  surface: z.number().positive().describe("Surface area in square meters (m²)."),
  floorLevel: z.number().int().describe("The floor this room is on (0 for ground floor)."),
  floorCovering: FloorCoveringEnum.optional().describe("Type of floor covering."),
  exposition: z.array(ExpositionEnum).optional().describe("Cardinal direction(s) the room's windows face."),
  features: z.array(z.string()).optional().describe("List of special features, e.g., 'Fireplace', 'Built-in Wardrobe', 'Ceiling Fan'."),
});

const OutdoorSpaceSchema = z.object({
  type: z.enum(['GARDEN', 'TERRACE', 'BALCONY', 'PATIO', 'ROOFTOP']),
  surface: z.number().positive().describe("Surface area in square meters (m²)."),
  isFenced: z.boolean().optional().describe("Is the area enclosed by a fence?"),
  hasPool: z.boolean().optional().describe("Does it have a swimming pool?"),
  poolDimensions: z.string().optional().describe("Dimensions of the pool, e.g., '8m x 4m'."),
  orientation: z.array(ExpositionEnum).optional().describe("Cardinal direction(s) the space faces."),
});

const EnergyPerformanceSchema = z.object({
  dpeClass: EnergyClassEnum.optional().describe("Diagnostic de Performance Énergétique (DPE) - Energy Performance Class."),
  gesClass: EnergyClassEnum.optional().describe("Gaz à Effet de Serre (GES) - Greenhouse Gas Emission Class."),
  estimatedAnnualEnergyCost: z.number().positive().optional().describe("Estimated annual energy cost in Euros."),
});

const MediaSchema = z.object({
  photos: z.array(z.object({
    url: z.string().url(),
    description: z.string().optional(),
    isCover: z.boolean().default(false),
  })).describe("List of photo URLs, with one marked as the cover image."),
  virtualTourUrl: z.string().url().optional().describe("URL for a 3D virtual tour (e.g., Matterport)."),
  videoUrl: z.string().url().optional().describe("URL for a promotional video."),
  floorPlans: z.array(z.object({
    url: z.string().url(),
    floorLevel: z.number().int().describe("Which floor this plan represents."),
  })).optional().describe("List of floor plan images."),
});


// =============================================================================
// MAIN REAL ESTATE PROPERTY SCHEMA
// =============================================================================

export const RealEstatePropertySchema = z.object({
  // --- Core Listing Information ---
  id: z.string().uuid().describe("Unique identifier for the property listing."),
  listingTitle: z.string().min(5).max(100).describe("A catchy, descriptive title for the listing."),
  description: z.string().min(50).describe("A detailed, rich-text enabled description of the property."),
  propertyType: PropertyTypeEnum,
  status: PropertyStatusEnum.default('DRAFT'),
  listingDate: z.date().default(() => new Date()).describe("The date the property was listed."),

  // --- Price & Financials ---
  price: z.object({
    amount: z.number().positive().describe("The asking price in Euros."),
    currency: z.string().length(3).default('EUR'),
    includesAgencyFees: z.boolean().describe("True if the price includes agency fees."),
    agencyFeePercentage: z.number().min(0).max(100).optional().describe("Percentage of the agency fee if applicable."),
  }),
  annualPropertyTax: z.number().positive().optional().describe("Annual property tax (taxe foncière) in Euros."),
  condominiumFees: z.number().positive().optional().describe("Monthly condominium fees in Euros (if applicable)."),

  // --- Location ---
  address: AddressSchema,

  // --- General Characteristics ---
  livingArea: z.number().positive().describe("Total habitable surface area in square meters (m²), also known as 'Loi Carrez' area."),
  totalPlotArea: z.number().positive().optional().describe("Total plot/land area in m² (for houses)."),
  numberOfFloorsInBuilding: z.number().int().positive().describe("Total number of floors in the entire building/house."),
  propertyFloorLevel: z.number().int().optional().describe("The floor the apartment is on (if applicable)."),
  hasElevator: z.boolean().optional().describe("Does the building have an elevator?"),
  yearOfConstruction: z.number().int().min(1000).max(new Date().getFullYear() + 5),
  lastRenovationYear: z.number().int().optional().describe("Year of the last significant renovation."),
  overallCondition: ConditionEnum,

  // --- Detailed Spaces ---
  rooms: z.array(RoomSchema).min(1).describe("An array detailing each room in the property."),
  totalBedrooms: z.number().int().min(0).describe("Total number of bedrooms."),
  totalBathrooms: z.number().int().min(0).describe("Total number of bathrooms/shower rooms."),
  outdoorSpaces: z.array(OutdoorSpaceSchema).optional().describe("Details of any outdoor spaces like gardens or balconies."),

  // --- Equipment, Finishes & Amenities ---
  kitchen: z.object({
    isEquipped: z.boolean().describe("Is the kitchen fitted with cabinets and appliances?"),
    type: z.enum(['SEPARATE', 'OPEN_PLAN', 'SEMI_OPEN']).optional(),
    appliances: z.array(z.string()).optional().describe("List of included appliances, e.g., 'Oven', 'Induction Hob', 'Dishwasher'."),
  }),
  
  heating: z.object({
    mainType: HeatingTypeEnum,
    distribution: z.enum(['RADIATORS', 'UNDERFLOOR', 'FORCED_AIR']).describe("How heat is distributed."),
    hasAirConditioning: z.boolean().default(false),
  }),

  amenities: z.array(z.string()).optional().describe("List of other amenities, e.g., 'Home Automation', 'Fiber Optic', 'Alarm System', 'Intercom'."),
  
  // --- Technical & Building Details ---
  windows: z.object({
    glazingType: z.enum(['SINGLE', 'DOUBLE', 'TRIPLE']).describe("Type of window glazing."),
    frameMaterial: z.enum(['WOOD', 'PVC', 'ALUMINUM']).describe("Material of the window frames."),
  }).optional(),
  insulationType: z.enum(['INTERIOR', 'EXTERIOR', 'NONE']).optional().describe("Type of wall insulation."),
  roofCondition: ConditionEnum.optional().describe("Condition of the roof (primarily for houses)."),

  parking: z.object({
    hasParking: z.boolean().default(false),
    type: z.enum(['GARAGE', 'OUTDOOR_SPACE', 'UNDERGROUND_BOX', 'CARPORT']).optional(),
    numberOfSpaces: z.number().int().positive().optional(),
  }).optional(),

  hasCellar: z.boolean().default(false).describe("Is there a cellar (cave)?"),
  
  // --- Diagnostics & Media ---
  energyPerformance: EnergyPerformanceSchema.optional(),
  media: MediaSchema,

  // --- Agent Information ---
  agent: z.object({
    id: z.string().uuid(),
    name: z.string(),
    email: z.string().email(),
    phone: z.string(),
  }).describe("Information about the listing agent."),
});

// To infer the TypeScript type from the schema:
type RealEstateProperty = z.infer<typeof RealEstatePropertySchema>;