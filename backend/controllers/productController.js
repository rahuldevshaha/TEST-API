const productService = require("../services/productService");
const default_img =process.env.PRODUCT_DEFAULT_THUMB


const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));



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



//Read Product By ID Controller
const getById = async (req, res, next) => {
  try {
    let ID = req.params.id;

    const product = await productService.getProductById(ID);
    if (!product) {
      res.status(404);
      throw new Error(`Product with id ${req.params.id} not found`);
    }
    res.json({ success: true, data: product });
  } catch (err) {
    next(err);
  }
};




//Update Product Controller
const update = async (req, res, next) => {
  try {
    const id = req.params.id;
    const data = req.body;

    const existing = await productService.getProductById(id);
    if (!existing)
    {return null;}

    const product = await productService.updateProduct(id, data);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: `Product with id ${id} not found`
      });
    }

    res.status(200).json({success: true, data: product});

  } catch (err) {
    next(err);
  }
};


//Delete Product Controller
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



//Delete Selected Product Controller
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