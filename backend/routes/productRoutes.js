const express = require("express");
const router = express.Router();
const controller = require("../controllers/productController");
const cacheMiddleware = require("../middleware/cacheMiddleware");

// NOTE: static/specific routes must be declared before the "/:id" route
// so Express doesn't swallow them as an id param.
router.post("/delete-selected", controller.deleteSelected);

router.route("/")
    .get(cacheMiddleware("products"), controller.getAll)
    .post(controller.create);

router.route("/:id")
    .get(cacheMiddleware("products"), controller.getById)
    .put(controller.update)
    .delete(controller.deleteOne);

module.exports = router;