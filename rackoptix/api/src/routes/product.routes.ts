/**
 * Product routes for the RackOptix API.
 */

import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { body, param, query } from 'express-validator';
import { validateRequest } from '../middleware/validation';
import * as productService from '../services/product.service';

// Create router
const productRoutes = Router();

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// GET /products - Get all products
productRoutes.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const products = await productService.getAllProducts();
    res.json(products);
  } catch (error) {
    next(error);
  }
});

// GET /products/:id - Get product by ID
productRoutes.get('/:id', 
  param('id').isString().notEmpty(),
  validateRequest,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const product = await productService.getProductById(req.params.id);
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }
      res.json(product);
    } catch (error) {
      next(error);
    }
  }
);

// POST /products - Create a new product
productRoutes.post('/',
  [
    body('sku').isString().notEmpty(),
    body('name').isString().notEmpty(),
    body('length').isNumeric(),
    body('width').isNumeric(),
    body('height').isNumeric(),
    body('weight').isNumeric(),
    body('velocity_class').isIn(['A', 'B', 'C']),
    body('storage_method').isIn(['pallet', 'case', 'tote', 'each']),
    body('stackable').isBoolean(),
    body('monthly_throughput').isNumeric()
  ],
  validateRequest,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const newProduct = await productService.createProduct(req.body);
      res.status(201).json(newProduct);
    } catch (error) {
      next(error);
    }
  }
);

// PUT /products/:id - Update a product
productRoutes.put('/:id',
  [
    param('id').isString().notEmpty(),
    body('sku').isString().optional(),
    body('name').isString().optional(),
    body('length').isNumeric().optional(),
    body('width').isNumeric().optional(),
    body('height').isNumeric().optional(),
    body('weight').isNumeric().optional(),
    body('velocity_class').isIn(['A', 'B', 'C']).optional(),
    body('storage_method').isIn(['pallet', 'case', 'tote', 'each']).optional(),
    body('stackable').isBoolean().optional(),
    body('monthly_throughput').isNumeric().optional()
  ],
  validateRequest,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const updatedProduct = await productService.updateProduct(req.params.id, req.body);
      if (!updatedProduct) {
        return res.status(404).json({ message: 'Product not found' });
      }
      res.json(updatedProduct);
    } catch (error) {
      next(error);
    }
  }
);

// DELETE /products/:id - Delete a product
productRoutes.delete('/:id',
  param('id').isString().notEmpty(),
  validateRequest,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await productService.deleteProduct(req.params.id);
      if (!result) {
        return res.status(404).json({ message: 'Product not found' });
      }
      res.status(204).end();
    } catch (error) {
      next(error);
    }
  }
);

// GET /products/categories - Get all product categories
productRoutes.get('/categories', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const categories = await productService.getAllCategories();
    res.json(categories);
  } catch (error) {
    next(error);
  }
});

// POST /products/categories - Create a new product category
productRoutes.post('/categories',
  [
    body('name').isString().notEmpty(),
    body('description').isString().optional()
  ],
  validateRequest,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const newCategory = await productService.createCategory(req.body);
      res.status(201).json(newCategory);
    } catch (error) {
      next(error);
    }
  }
);

// PUT /products/categories/:id - Update a product category
productRoutes.put('/categories/:id',
  [
    param('id').isString().notEmpty(),
    body('name').isString().optional(),
    body('description').isString().optional()
  ],
  validateRequest,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const updatedCategory = await productService.updateCategory(req.params.id, req.body);
      if (!updatedCategory) {
        return res.status(404).json({ message: 'Category not found' });
      }
      res.json(updatedCategory);
    } catch (error) {
      next(error);
    }
  }
);

// DELETE /products/categories/:id - Delete a product category
productRoutes.delete('/categories/:id',
  param('id').isString().notEmpty(),
  validateRequest,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await productService.deleteCategory(req.params.id);
      if (!result) {
        return res.status(404).json({ message: 'Category not found' });
      }
      res.status(204).end();
    } catch (error) {
      next(error);
    }
  }
);

// POST /products/classify - Classify products by velocity
productRoutes.post('/classify',
  [
    body('method').isIn(['abc', 'xyz', 'custom']),
    body('params').isObject().optional()
  ],
  validateRequest,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { method, params } = req.body;
      const result = await productService.classifyProducts(method, params);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
);

// POST /products/import - Import products from file
productRoutes.post('/import',
  upload.single('file'),
  query('format').isIn(['csv', 'excel']),
  validateRequest,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }

      const format = (req.query.format as 'csv' | 'excel');
      const result = await productService.importProducts(req.file.buffer, format);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
);

// GET /products/export - Export products to file
productRoutes.get('/export',
  query('format').isIn(['csv', 'excel']),
  validateRequest,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const format = req.query.format as 'csv' | 'excel';
      const { data, filename } = await productService.exportProducts(format);

      res.setHeader('Content-Type', format === 'csv' ? 'text/csv' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
      res.send(data);
    } catch (error) {
      next(error);
    }
  }
);

export { productRoutes };