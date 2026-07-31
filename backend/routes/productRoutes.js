const express = require("express");
const router = express.Router();
const controller = require("../controllers/productController");
const cacheMiddleware = require("../middleware/cacheMiddleware");



router.route("/")
    .get(cacheMiddleware("products"), controller.getAll)
    .post(controller.create);

router.route("/:id")
    .get(cacheMiddleware("products"), controller.getById)
    .put(controller.update)
    .delete(controller.deleteOne);

router.post("/delete-selected", controller.deleteSelected);


module.exports = router;