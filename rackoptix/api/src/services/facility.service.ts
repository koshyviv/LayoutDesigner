import { v4 as uuidv4 } from 'uuid';
import type {
  Facility,
  FacilityMetadata,
  Boundary,
  CreateFacilityDto,
  UpdateFacilityDto
} from '../models/Facility';
import type { Zone, CreateZoneDto, UpdateZoneDto } from '../models/Zone';
import type { Obstruction, CreateObstructionDto, UpdateObstructionDto } from '../models/Obstruction';
import { NotFoundError, ValidationError } from '../utils/errors';

interface FacilityRecord extends Facility {
  metadata?: FacilityMetadata;
  zones: Zone[];
  obstructions: Obstruction[];
}

type FacilityInput = CreateFacilityDto & {
  description?: string;
  metadata?: FacilityMetadata;
  zones?: CreateZoneDto[];
  obstructions?: CreateObstructionDto[];
};

type FacilityUpdate = UpdateFacilityDto & {
  description?: string;
  metadata?: FacilityMetadata;
  zones?: CreateZoneDto[];
  obstructions?: CreateObstructionDto[];
};

const createSampleFacility = (): FacilityRecord => ({
  id: 'facility-1',
  name: 'Chicago Distribution Center',
  description: 'Main distribution facility for Midwest region',
  clear_height: 32.5,
  boundary: {
    type: 'Polygon',
    coordinates: [
      [
        [0, 0],
        [0, 500],
        [800, 500],
        [800, 0],
        [0, 0]
      ]
    ]
  },
  metadata: {
    address: '123 Warehouse Blvd, Chicago, IL',
    square_footage: 400000,
    year_built: 2010,
    sprinkler_type: 'ESFR'
  },
  obstructions: [],
  zones: []
});

let facilities: FacilityRecord[] = [createSampleFacility()];

const deepClone = <T>(value: T): T => JSON.parse(JSON.stringify(value));

export class FacilityService {
  async getAllFacilities(): Promise<FacilityRecord[]> {
    return facilities.map(deepClone);
  }

  async getFacilityById(id: string): Promise<FacilityRecord | null> {
    const facility = facilities.find((item) => item.id === id);
    return facility ? deepClone(facility) : null;
  }

  async createFacility(facilityData: FacilityInput): Promise<FacilityRecord> {
    this.validateFacilityData(facilityData);

    const timestamp = new Date().toISOString();
    const facility: FacilityRecord = {
      id: `facility-${uuidv4()}`,
      name: facilityData.name,
      description: facilityData.description,
      clear_height: facilityData.clear_height,
      boundary: deepClone(facilityData.boundary),
      metadata: facilityData.metadata ? deepClone(facilityData.metadata) : undefined,
      created_at: timestamp,
      updated_at: timestamp,
      zones: [],
      obstructions: []
    };

    if (facilityData.zones) {
      for (const zone of facilityData.zones) {
        facility.zones.push(this.createZoneRecord(facility.id, zone));
      }
    }

    if (facilityData.obstructions) {
      for (const obstruction of facilityData.obstructions) {
        facility.obstructions.push(this.createObstructionRecord(facility.id, obstruction));
      }
    }

    facilities.push(facility);
    return deepClone(facility);
  }

  async updateFacility(id: string, facilityData: FacilityUpdate): Promise<FacilityRecord | null> {
    const facility = facilities.find((item) => item.id === id);
    if (!facility) {
      return null;
    }

    this.validateFacilityUpdate(facilityData);

    if (facilityData.name !== undefined) {
      facility.name = facilityData.name;
    }

    if (facilityData.description !== undefined) {
      facility.description = facilityData.description;
    }

    if (facilityData.clear_height !== undefined) {
      facility.clear_height = facilityData.clear_height;
    }

    if (facilityData.boundary) {
      facility.boundary = deepClone(facilityData.boundary);
    }

    if (facilityData.metadata) {
      facility.metadata = deepClone(facilityData.metadata);
    }

    if (facilityData.zones) {
      facility.zones = facilityData.zones.map((zone) => this.createZoneRecord(id, zone));
    }

    if (facilityData.obstructions) {
      facility.obstructions = facilityData.obstructions.map((obstruction) =>
        this.createObstructionRecord(id, obstruction)
      );
    }

    facility.updated_at = new Date().toISOString();

    return deepClone(facility);
  }

  async deleteFacility(id: string): Promise<boolean> {
    const initialLength = facilities.length;
    facilities = facilities.filter((facility) => facility.id !== id);
    return facilities.length < initialLength;
  }

  async addZoneToFacility(facilityId: string, zoneData: CreateZoneDto): Promise<Zone> {
    const facility = facilities.find((item) => item.id === facilityId);
    if (!facility) {
      throw new NotFoundError('Facility not found');
    }

    this.validateZoneData(zoneData, true);
    const zone = this.createZoneRecord(facilityId, zoneData);
    facility.zones.push(zone);
    facility.updated_at = new Date().toISOString();
    return deepClone(zone);
  }

  async addObstructionToFacility(facilityId: string, obstructionData: CreateObstructionDto): Promise<Obstruction> {
    const facility = facilities.find((item) => item.id === facilityId);
    if (!facility) {
      throw new NotFoundError('Facility not found');
    }

    this.validateObstructionData(obstructionData, true);
    const obstruction = this.createObstructionRecord(facilityId, obstructionData);
    facility.obstructions.push(obstruction);
    facility.updated_at = new Date().toISOString();
    return deepClone(obstruction);
  }

  async getFacilityObstructions(id: string): Promise<Obstruction[]> {
    const facility = facilities.find((item) => item.id === id);
    if (!facility) {
      throw new NotFoundError('Facility not found');
    }

    return facility.obstructions.map(deepClone);
  }

  async updateFacilityObstruction(
    facilityId: string,
    obstructionId: string,
    data: UpdateObstructionDto
  ): Promise<Obstruction> {
    const facility = facilities.find((item) => item.id === facilityId);
    if (!facility) {
      throw new NotFoundError('Facility not found');
    }

    const obstruction = facility.obstructions.find((item) => item.id === obstructionId);
    if (!obstruction) {
      throw new NotFoundError('Obstruction not found');
    }

    this.validateObstructionData(data);

    if (data.type !== undefined) {
      obstruction.type = data.type;
    }

    if (data.shape) {
      this.validateShape(data.shape);
      obstruction.shape = deepClone(data.shape);
    }

    if (data.height !== undefined) {
      if (typeof data.height !== 'number' || data.height <= 0) {
        throw new ValidationError('Obstruction height must be a positive number');
      }
      obstruction.height = data.height;
    }

    if (data.properties) {
      obstruction.properties = deepClone(data.properties);
    }

    facility.updated_at = new Date().toISOString();
    return deepClone(obstruction);
  }

  async deleteFacilityObstruction(facilityId: string, obstructionId: string): Promise<boolean> {
    const facility = facilities.find((item) => item.id === facilityId);
    if (!facility) {
      throw new NotFoundError('Facility not found');
    }

    const initialLength = facility.obstructions.length;
    facility.obstructions = facility.obstructions.filter((item) => item.id !== obstructionId);
    const deleted = facility.obstructions.length < initialLength;

    if (deleted) {
      facility.updated_at = new Date().toISOString();
    }

    return deleted;
  }

  async getFacilityZones(id: string): Promise<Zone[]> {
    const facility = facilities.find((item) => item.id === id);
    if (!facility) {
      throw new NotFoundError('Facility not found');
    }

    return facility.zones.map(deepClone);
  }

  async updateFacilityZone(facilityId: string, zoneId: string, data: UpdateZoneDto): Promise<Zone> {
    const facility = facilities.find((item) => item.id === facilityId);
    if (!facility) {
      throw new NotFoundError('Facility not found');
    }

    const zone = facility.zones.find((item) => item.id === zoneId);
    if (!zone) {
      throw new NotFoundError('Zone not found');
    }

    this.validateZoneData(data);

    if (data.name !== undefined) {
      zone.name = data.name;
    }

    if (data.purpose !== undefined) {
      zone.purpose = data.purpose;
    }

    if (data.boundary) {
      this.validateBoundary(data.boundary);
      zone.boundary = deepClone(data.boundary);
    }

    if (data.properties) {
      zone.properties = deepClone(data.properties);
    }

    facility.updated_at = new Date().toISOString();
    return deepClone(zone);
  }

  async deleteFacilityZone(facilityId: string, zoneId: string): Promise<boolean> {
    const facility = facilities.find((item) => item.id === facilityId);
    if (!facility) {
      throw new NotFoundError('Facility not found');
    }

    const initialLength = facility.zones.length;
    facility.zones = facility.zones.filter((item) => item.id !== zoneId);
    const deleted = facility.zones.length < initialLength;

    if (deleted) {
      facility.updated_at = new Date().toISOString();
    }

    return deleted;
  }

  async getFacilitiesInBounds(bounds: {
    minLat: number;
    minLng: number;
    maxLat: number;
    maxLng: number;
  }): Promise<FacilityRecord[]> {
    const facilitiesInBounds = facilities.filter((facility) => {
      const coordinates = facility.boundary.coordinates?.[0];
      if (!coordinates) {
        return false;
      }

      return coordinates.some(([x, y]) =>
        x >= bounds.minLng &&
        x <= bounds.maxLng &&
        y >= bounds.minLat &&
        y <= bounds.maxLat
      );
    });

    return facilitiesInBounds.map(deepClone);
  }

  async calculateFacilityArea(id: string): Promise<number> {
    const facility = facilities.find((item) => item.id === id);
    if (!facility) {
      throw new NotFoundError('Facility not found');
    }

    const coordinates = facility.boundary.coordinates?.[0];
    if (!coordinates || coordinates.length < 4) {
      throw new ValidationError('Facility boundary must contain at least 4 points');
    }

    let area = 0;
    for (let i = 0; i < coordinates.length - 1; i += 1) {
      const [x1, y1] = coordinates[i];
      const [x2, y2] = coordinates[i + 1];
      area += (x1 * y2) - (x2 * y1);
    }

    return Math.abs(area / 2);
  }

  private createZoneRecord(facilityId: string, zoneData: CreateZoneDto): Zone {
    this.validateZoneData(zoneData);

    return {
      id: `zone-${uuidv4()}`,
      facility_id: facilityId,
      name: zoneData.name,
      purpose: zoneData.purpose,
      boundary: deepClone(zoneData.boundary),
      properties: zoneData.properties ? deepClone(zoneData.properties) : {}
    };
  }

  private createObstructionRecord(
    facilityId: string,
    obstructionData: CreateObstructionDto
  ): Obstruction {
    this.validateObstructionData(obstructionData, true);

    return {
      id: `obstruction-${uuidv4()}`,
      facility_id: facilityId,
      type: obstructionData.type,
      shape: deepClone(obstructionData.shape),
      height: obstructionData.height,
      properties: obstructionData.properties ? deepClone(obstructionData.properties) : {}
    };
  }

  private validateFacilityData(facilityData: FacilityInput): void {
    if (!facilityData.name) {
      throw new ValidationError('Facility name is required');
    }

    if (typeof facilityData.clear_height !== 'number' || facilityData.clear_height <= 0) {
      throw new ValidationError('Facility clear_height must be a positive number');
    }

    this.validateBoundary(facilityData.boundary);
  }

  private validateFacilityUpdate(facilityData: FacilityUpdate): void {
    if (facilityData.clear_height !== undefined) {
      if (typeof facilityData.clear_height !== 'number' || facilityData.clear_height <= 0) {
        throw new ValidationError('Facility clear_height must be a positive number');
      }
    }

    if (facilityData.boundary) {
      this.validateBoundary(facilityData.boundary);
    }

    if (facilityData.zones) {
      facilityData.zones.forEach((zone) => this.validateZoneData(zone, true));
    }

    if (facilityData.obstructions) {
      facilityData.obstructions.forEach((obstruction) => this.validateObstructionData(obstruction, true));
    }
  }

  private validateBoundary(boundary: Boundary): void {
    if (!boundary || boundary.type !== 'Polygon' || !Array.isArray(boundary.coordinates)) {
      throw new ValidationError('Facility boundary must be a Polygon with coordinates');
    }

    const exteriorRing = boundary.coordinates[0];
    if (!Array.isArray(exteriorRing) || exteriorRing.length < 4) {
      throw new ValidationError('Facility boundary must contain at least 4 points');
    }

    const [firstX, firstY] = exteriorRing[0];
    const [lastX, lastY] = exteriorRing[exteriorRing.length - 1];
    if (firstX !== lastX || firstY !== lastY) {
      throw new ValidationError('Facility boundary must be closed (first point equals last point)');
    }
  }

  private validateZoneData(zoneData: CreateZoneDto | UpdateZoneDto, requireFullData = false): void {
    if (requireFullData || zoneData.name !== undefined) {
      if (!zoneData.name) {
        throw new ValidationError('Zone name is required');
      }
    }

    if (requireFullData || zoneData.purpose !== undefined) {
      if (!zoneData.purpose) {
        throw new ValidationError('Zone purpose is required');
      }
    }

    if (zoneData.boundary) {
      this.validateBoundary(zoneData.boundary);
    } else if (requireFullData) {
      throw new ValidationError('Zone boundary is required');
    }
  }

  private validateObstructionData(
    obstructionData: CreateObstructionDto | UpdateObstructionDto,
    requireFullData = false
  ): void {
    if (requireFullData || obstructionData.type !== undefined) {
      if (!obstructionData.type) {
        throw new ValidationError('Obstruction type is required');
      }
    }

    if (requireFullData || obstructionData.height !== undefined) {
      if (obstructionData.height === undefined || obstructionData.height <= 0) {
        throw new ValidationError('Obstruction height must be a positive number');
      }
    }

    if (obstructionData.shape) {
      this.validateShape(obstructionData.shape);
    } else if (requireFullData) {
      throw new ValidationError('Obstruction shape is required');
    }
  }

  private validateShape(shape: Obstruction['shape']): void {
    if (!shape || !shape.type || !shape.coordinates) {
      throw new ValidationError('Obstruction shape must include type and coordinates');
    }

    const coordinates = shape.coordinates as number[][][] | number[][];
    if (!Array.isArray(coordinates) || coordinates.length === 0) {
      throw new ValidationError('Obstruction shape coordinates are required');
    }
  }
}

const facilityService = new FacilityService();

export const getAllFacilities = facilityService.getAllFacilities.bind(facilityService);
export const getFacilityById = facilityService.getFacilityById.bind(facilityService);
export const createFacility = facilityService.createFacility.bind(facilityService);
export const updateFacility = facilityService.updateFacility.bind(facilityService);
export const deleteFacility = facilityService.deleteFacility.bind(facilityService);
export const addZoneToFacility = facilityService.addZoneToFacility.bind(facilityService);
export const addObstructionToFacility = facilityService.addObstructionToFacility.bind(facilityService);
export const getFacilityObstructions = facilityService.getFacilityObstructions.bind(facilityService);
export const createFacilityObstruction = facilityService.addObstructionToFacility.bind(facilityService);
export const updateFacilityObstruction = facilityService.updateFacilityObstruction.bind(facilityService);
export const deleteFacilityObstruction = facilityService.deleteFacilityObstruction.bind(facilityService);
export const getFacilityZones = facilityService.getFacilityZones.bind(facilityService);
export const createFacilityZone = facilityService.addZoneToFacility.bind(facilityService);
export const updateFacilityZone = facilityService.updateFacilityZone.bind(facilityService);
export const deleteFacilityZone = facilityService.deleteFacilityZone.bind(facilityService);
export const getFacilitiesInBounds = facilityService.getFacilitiesInBounds.bind(facilityService);
export const calculateFacilityArea = facilityService.calculateFacilityArea.bind(facilityService);
