const productService = require("../services/productService");
const default_img =process.env.PRODUCT_DEFAULT_THUMB




//Create Product Controller
const create = async (req, res, next) => {
  try {

    let payloadData={
      title: req.body.title,
      description: req.body.description || "",
      category: req.body.category || "",
      price: Number(req.body.price) || 0,
      discountPercentage: Number(req.body.discountPercentage) || 0,
      rating: Number(req.body.rating) || 0,
      stock: Number(req.body.stock) || 0,
      brand: req.body.brand || "",
      thumbnail: req.body.thumbnail || default_img,
      images: req.body.images || [],
      createdAt: new Date().toISOString(),
    }
    const product = await productService.createProduct(payloadData);
    res.status(201).json({ success: true, data: product });
  } catch (err) {
    next(err);
  }
};




//Read All Product Controller
const getAll = async (req, res, next) => {
  try {
    const { search = "", page = 1, limit = 20 } = req.query;
    const result = await productService.getAllProducts({ search, page, limit });
    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
};




// @route GET /api/products/:id
const getById = async (req, res, next) => {
  try {
    const product = await productService.getProductById(req.params.id);
    if (!product) {
      res.status(404);
      throw new Error(`Product with id ${req.params.id} not found`);
    }
    res.json({ success: true, data: product });
  } catch (err) {
    next(err);
  }
};




// @route PUT /api/products/:id
const update = async (req, res, next) => {
  try {
    const product = await productService.updateProduct(req.params.id, req.body);
    if (!product) {
      res.status(404);
      throw new Error(`Product with id ${req.params.id} not found`);
    }
    res.json({ success: true, data: product });
  } catch (err) {
    next(err);
  }
};



// @route DELETE /api/products/:id
const deleteOne = async (req, res, next) => {
  try {
    const product = await productService.deleteProduct(req.params.id);
    if (!product) {
      res.status(404);
      throw new Error(`Product with id ${req.params.id} not found`);
    }
    res.json({ success: true, message: `Product ${req.params.id} deleted` });
  } catch (err) {
    next(err);
  }
};



// @route POST /api/products/delete-selected  body: { ids: [1,2,3] }
const deleteSelected = async (req, res, next) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      res.status(400);
      throw new Error("Request body must include a non-empty 'ids' array");
    }
    const { deletedCount, failedIds } = await productService.deleteSelectedProducts(ids);
    res.json({ success: true, deletedCount, failedIds });
  } catch (err) {
    next(err);
  }
};



module.exports = {
  getAll,
  getById,
  create,
  update,
  deleteOne,
  deleteSelected,
};