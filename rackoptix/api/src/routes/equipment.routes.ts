/**
 * Equipment routes for the RackOptix API.
 */

import { Router, Request, Response, NextFunction } from 'express';
import { body, param, query } from 'express-validator';
import { validateRequest } from '../middleware/validation';
import * as equipmentService from '../services/equipment.service';

// Create router
const equipmentRoutes = Router();

// GET /equipment - Get all equipment
equipmentRoutes.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const equipment = await equipmentService.getAllEquipment();
    res.json(equipment);
  } catch (error) {
    next(error);
  }
});

// GET /equipment/:id - Get equipment by ID
equipmentRoutes.get('/:id', 
  param('id').isString().notEmpty(),
  validateRequest,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const equipment = await equipmentService.getEquipmentById(req.params.id);
      if (!equipment) {
        return res.status(404).json({ message: 'Equipment not found' });
      }
      res.json(equipment);
    } catch (error) {
      next(error);
    }
  }
);

// POST /equipment - Create new equipment
equipmentRoutes.post('/',
  [
    body('type_id').isString().notEmpty(),
    body('name').isString().notEmpty(),
    body('reach_height').isNumeric(),
    body('min_aisle_width').isNumeric(),
    body('max_aisle_width').isNumeric(),
    body('turning_radius').isNumeric(),
    body('lift_capacity').isNumeric(),
    body('specifications').isObject().optional()
  ],
  validateRequest,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const newEquipment = await equipmentService.createEquipment(req.body);
      res.status(201).json(newEquipment);
    } catch (error) {
      next(error);
    }
  }
);

// PUT /equipment/:id - Update equipment
equipmentRoutes.put('/:id',
  [
    param('id').isString().notEmpty(),
    body('type_id').isString().optional(),
    body('name').isString().optional(),
    body('reach_height').isNumeric().optional(),
    body('min_aisle_width').isNumeric().optional(),
    body('max_aisle_width').isNumeric().optional(),
    body('turning_radius').isNumeric().optional(),
    body('lift_capacity').isNumeric().optional(),
    body('specifications').isObject().optional()
  ],
  validateRequest,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const updatedEquipment = await equipmentService.updateEquipment(req.params.id, req.body);
      if (!updatedEquipment) {
        return res.status(404).json({ message: 'Equipment not found' });
      }
      res.json(updatedEquipment);
    } catch (error) {
      next(error);
    }
  }
);

// DELETE /equipment/:id - Delete equipment
equipmentRoutes.delete('/:id',
  param('id').isString().notEmpty(),
  validateRequest,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await equipmentService.deleteEquipment(req.params.id);
      if (!result) {
        return res.status(404).json({ message: 'Equipment not found' });
      }
      res.status(204).end();
    } catch (error) {
      next(error);
    }
  }
);

// GET /equipment/types - Get all equipment types
equipmentRoutes.get('/types', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const types = await equipmentService.getAllEquipmentTypes();
    res.json(types);
  } catch (error) {
    next(error);
  }
});

// GET /equipment/types/:id - Get equipment type by ID
equipmentRoutes.get('/types/:id', 
  param('id').isString().notEmpty(),
  validateRequest,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const type = await equipmentService.getEquipmentTypeById(req.params.id);
      if (!type) {
        return res.status(404).json({ message: 'Equipment type not found' });
      }
      res.json(type);
    } catch (error) {
      next(error);
    }
  }
);

// POST /equipment/types - Create new equipment type
equipmentRoutes.post('/types',
  [
    body('name').isString().notEmpty(),
    body('description').isString().optional()
  ],
  validateRequest,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const newType = await equipmentService.createEquipmentType(req.body);
      res.status(201).json(newType);
    } catch (error) {
      next(error);
    }
  }
);

// PUT /equipment/types/:id - Update equipment type
equipmentRoutes.put('/types/:id',
  [
    param('id').isString().notEmpty(),
    body('name').isString().optional(),
    body('description').isString().optional()
  ],
  validateRequest,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const updatedType = await equipmentService.updateEquipmentType(req.params.id, req.body);
      if (!updatedType) {
        return res.status(404).json({ message: 'Equipment type not found' });
      }
      res.json(updatedType);
    } catch (error) {
      next(error);
    }
  }
);

// DELETE /equipment/types/:id - Delete equipment type
equipmentRoutes.delete('/types/:id',
  param('id').isString().notEmpty(),
  validateRequest,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await equipmentService.deleteEquipmentType(req.params.id);
      if (!result) {
        return res.status(404).json({ message: 'Equipment type not found' });
      }
      res.status(204).end();
    } catch (error) {
      next(error);
    }
  }
);

// GET /equipment/:id/compatibility/:rackId - Check equipment-rack compatibility
equipmentRoutes.get('/:id/compatibility/:rackId',
  [
    param('id').isString().notEmpty(),
    param('rackId').isString().notEmpty()
  ],
  validateRequest,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id, rackId } = req.params;
      const result = await equipmentService.checkRackCompatibility(id, rackId);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
);

export { equipmentRoutes };