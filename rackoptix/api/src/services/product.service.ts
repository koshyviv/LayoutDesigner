/**
 * Product service for the RackOptix API.
 * 
 * This service handles business logic for product management.
 */

import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import csvParser from 'csv-parser';
import * as XLSX from 'xlsx';
import { Readable } from 'stream';
import { logger } from '../utils/logger';

// Types
export interface ProductCategory {
  id: string;
  name: string;
  description: string;
}

export interface Product {
  id: string;
  category_id?: string;
  sku: string;
  name: string;
  description: string;
  
  // Physical dimensions
  length: number;
  width: number;
  height: number;
  weight: number;
  
  // Operational characteristics
  velocity_class: 'A' | 'B' | 'C';
  storage_method: 'pallet' | 'case' | 'tote' | 'each';
  stackable: boolean;
  
  // Special requirements
  handling_limitations?: Record<string, any>;
  environmental_reqs?: Record<string, any>;
  monthly_throughput: number;
}

// Mock data for development
let products: Product[] = [
  {
    id: 'product-1',
    sku: 'SKU001',
    name: 'Standard Pallet',
    description: 'Standard wooden pallet',
    length: 48,
    width: 40,
    height: 6,
    weight: 50,
    velocity_class: 'A',
    storage_method: 'pallet',
    stackable: true,
    monthly_throughput: 500
  },
  {
    id: 'product-2',
    sku: 'SKU002',
    name: 'Medium Box',
    description: 'Medium-sized cardboard box',
    length: 24,
    width: 18,
    height: 12,
    weight: 15,
    velocity_class: 'B',
    storage_method: 'case',
    stackable: true,
    monthly_throughput: 250
  },
  {
    id: 'product-3',
    sku: 'SKU003',
    name: 'Small Container',
    description: 'Small plastic container',
    length: 12,
    width: 10,
    height: 8,
    weight: 5,
    velocity_class: 'C',
    storage_method: 'tote',
    stackable: true,
    monthly_throughput: 100
  }
];

let categories: ProductCategory[] = [
  {
    id: 'category-1',
    name: 'Raw Materials',
    description: 'Raw materials for manufacturing'
  },
  {
    id: 'category-2',
    name: 'Finished Goods',
    description: 'Completed products ready for sale'
  },
  {
    id: 'category-3',
    name: 'Packaging',
    description: 'Packaging materials'
  }
];

// Backend URL for Python services
const BACKEND_URL = 'http://localhost:5000';

/**
 * Get all products.
 * 
 * @returns Array of products
 */
export async function getAllProducts(): Promise<Product[]> {
  // In a real implementation, this would fetch from a database
  // For now, return mock data
  return products;
}

/**
 * Get product by ID.
 * 
 * @param id Product ID
 * @returns Product or null if not found
 */
export async function getProductById(id: string): Promise<Product | null> {
  // In a real implementation, this would fetch from a database
  // For now, search mock data
  const product = products.find(p => p.id === id);
  return product || null;
}

/**
 * Create a new product.
 * 
 * @param productData Product data
 * @returns Newly created product
 */
export async function createProduct(productData: Omit<Product, 'id'>): Promise<Product> {
  // In a real implementation, this would save to a database
  // For now, add to mock data
  const newProduct: Product = {
    ...productData,
    id: `product-${uuidv4()}`
  };
  
  products.push(newProduct);
  return newProduct;
}

/**
 * Update an existing product.
 * 
 * @param id Product ID
 * @param updates Product updates
 * @returns Updated product or null if not found
 */
export async function updateProduct(id: string, updates: Partial<Product>): Promise<Product | null> {
  // In a real implementation, this would update in a database
  // For now, update mock data
  const index = products.findIndex(p => p.id === id);
  if (index === -1) return null;
  
  const updatedProduct = {
    ...products[index],
    ...updates
  };
  
  products[index] = updatedProduct;
  return updatedProduct;
}

/**
 * Delete a product.
 * 
 * @param id Product ID
 * @returns True if deleted, false if not found
 */
export async function deleteProduct(id: string): Promise<boolean> {
  // In a real implementation, this would delete from a database
  // For now, remove from mock data
  const initialLength = products.length;
  products = products.filter(p => p.id !== id);
  return products.length < initialLength;
}

/**
 * Get all product categories.
 * 
 * @returns Array of product categories
 */
export async function getAllCategories(): Promise<ProductCategory[]> {
  // In a real implementation, this would fetch from a database
  // For now, return mock data
  return categories;
}

/**
 * Create a new product category.
 * 
 * @param categoryData Category data
 * @returns Newly created category
 */
export async function createCategory(categoryData: Omit<ProductCategory, 'id'>): Promise<ProductCategory> {
  // In a real implementation, this would save to a database
  // For now, add to mock data
  const newCategory: ProductCategory = {
    ...categoryData,
    id: `category-${uuidv4()}`
  };
  
  categories.push(newCategory);
  return newCategory;
}

/**
 * Update an existing product category.
 * 
 * @param id Category ID
 * @param updates Category updates
 * @returns Updated category or null if not found
 */
export async function updateCategory(id: string, updates: Partial<ProductCategory>): Promise<ProductCategory | null> {
  // In a real implementation, this would update in a database
  // For now, update mock data
  const index = categories.findIndex(c => c.id === id);
  if (index === -1) return null;
  
  const updatedCategory = {
    ...categories[index],
    ...updates
  };
  
  categories[index] = updatedCategory;
  return updatedCategory;
}

/**
 * Delete a product category.
 * 
 * @param id Category ID
 * @returns True if deleted, false if not found
 */
export async function deleteCategory(id: string): Promise<boolean> {
  // In a real implementation, this would delete from a database
  // For now, remove from mock data
  const initialLength = categories.length;
  categories = categories.filter(c => c.id !== id);
  return categories.length < initialLength;
}

/**
 * Classify products by velocity.
 * 
 * @param method Classification method ('abc', 'xyz', or 'custom')
 * @param params Additional parameters for classification
 * @returns Updated products with new velocity classifications
 */
export async function classifyProducts(
  method: 'abc' | 'xyz' | 'custom',
  params?: Record<string, any>
): Promise<Product[]> {
  try {
    // In a real implementation, this would call the Python backend
    // const response = await axios.post(`${BACKEND_URL}/products/classify`, {
    //   method,
    //   params,
    //   products
    // });
    // const updatedProducts = response.data;
    // products = updatedProducts;
    // return updatedProducts;
    
    // For now, simulate classification
    if (method === 'abc') {
      // Sort by monthly throughput
      products.sort((a, b) => b.monthly_throughput - a.monthly_throughput);
      
      // Assign velocity classes
      const totalProducts = products.length;
      products = products.map((product, index) => {
        let velocity_class: 'A' | 'B' | 'C';
        
        if (index < totalProducts * 0.2) {
          velocity_class = 'A';
        } else if (index < totalProducts * 0.5) {
          velocity_class = 'B';
        } else {
          velocity_class = 'C';
        }
        
        return { ...product, velocity_class };
      });
    } else if (method === 'xyz') {
      // Simulate XYZ analysis (based on variability)
      // In a real implementation, this would use actual variability data
      products = products.map(product => {
        // Random assignment for simulation
        const rand = Math.random();
        let velocity_class: 'A' | 'B' | 'C';
        
        if (rand < 0.3) {
          velocity_class = 'A';
        } else if (rand < 0.7) {
          velocity_class = 'B';
        } else {
          velocity_class = 'C';
        }
        
        return { ...product, velocity_class };
      });
    }
    
    return products;
  } catch (error) {
    logger.error('Error classifying products:', error);
    throw new Error('Failed to classify products');
  }
}

/**
 * Import products from a file.
 * 
 * @param fileBuffer File buffer
 * @param format File format ('csv' or 'excel')
 * @returns Array of imported products
 */
export async function importProducts(
  fileBuffer: Buffer,
  format: 'csv' | 'excel'
): Promise<Product[]> {
  try {
    let importedProducts: Product[] = [];
    
    if (format === 'csv') {
      // Parse CSV
      const results: Record<string, string>[] = [];
      const stream = Readable.from(fileBuffer);

      await new Promise<void>((resolve, reject) => {
        stream
          .pipe(csvParser())
          .on('data', (data: Record<string, string>) => results.push(data))
          .on('end', () => resolve())
          .on('error', (error: Error) => reject(error));
      });

      // Convert to products
      importedProducts = results.map(row => ({
        id: `product-${uuidv4()}`,
        sku: row.sku || '',
        name: row.name || '',
        description: row.description || '',
        length: parseFloat(row.length) || 0,
        width: parseFloat(row.width) || 0,
        height: parseFloat(row.height) || 0,
        weight: parseFloat(row.weight) || 0,
        velocity_class: (row.velocity_class || 'C') as 'A' | 'B' | 'C',
        storage_method: (row.storage_method || 'pallet') as 'pallet' | 'case' | 'tote' | 'each',
        stackable: row.stackable === 'true' || row.stackable === '1',
        monthly_throughput: parseInt(row.monthly_throughput, 10) || 0
      }));
    } else if (format === 'excel') {
      // Parse Excel
      const workbook = XLSX.read(fileBuffer);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet);

      // Convert to products
      importedProducts = rows.map((row) => ({
        id: `product-${uuidv4()}`,
        sku: (row.sku as string) || '',
        name: (row.name as string) || '',
        description: (row.description as string) || '',
        length: parseFloat(String(row.length)) || 0,
        width: parseFloat(String(row.width)) || 0,
        height: parseFloat(String(row.height)) || 0,
        weight: parseFloat(String(row.weight)) || 0,
        velocity_class: ((row.velocity_class as string) || 'C') as 'A' | 'B' | 'C',
        storage_method: ((row.storage_method as string) || 'pallet') as 'pallet' | 'case' | 'tote' | 'each',
        stackable: row.stackable === true || row.stackable === 1,
        monthly_throughput: parseInt(String(row.monthly_throughput), 10) || 0
      }));
    }
    
    // Add imported products to existing products
    products = [...products, ...importedProducts];
    
    return importedProducts;
  } catch (error) {
    logger.error('Error importing products:', error);
    throw new Error('Failed to import products');
  }
}

/**
 * Export products to a file.
 * 
 * @param format File format ('csv' or 'excel')
 * @returns Object containing file data and filename
 */
export async function exportProducts(
  format: 'csv' | 'excel'
): Promise<{ data: Buffer, filename: string }> {
  try {
    if (format === 'csv') {
      // Generate CSV
      const header = 'id,sku,name,description,length,width,height,weight,velocity_class,storage_method,stackable,monthly_throughput\n';
      const rows = products.map(p => 
        `${p.id},${p.sku},${p.name},${p.description},${p.length},${p.width},${p.height},${p.weight},${p.velocity_class},${p.storage_method},${p.stackable},${p.monthly_throughput}`
      ).join('\n');
      
      const csvData = header + rows;
      return {
        data: Buffer.from(csvData),
        filename: `products_${new Date().toISOString().split('T')[0]}.csv`
      };
    } else if (format === 'excel') {
      // Generate Excel
      const worksheet = XLSX.utils.json_to_sheet(products);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Products');
      
      const excelData = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
      return {
        data: excelData,
        filename: `products_${new Date().toISOString().split('T')[0]}.xlsx`
      };
    }
    
    throw new Error(`Unsupported format: ${format}`);
  } catch (error) {
    logger.error('Error exporting products:', error);
    throw new Error('Failed to export products');
  }
}