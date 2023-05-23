const Router = require("express").Router;
const userController = require("../controllers/UserController/UserController");
const router = new Router();
const userService = require('../services/userService/userService');
router.post("/login", userController.login);
router.get("/active/:id", userController.active);

// router.get('/active/:email', async (req, res) => {
//     try {
//         const { email } = req.params;
//         console.log('EMAIL NA GET ZAPROS', email);
//         const isActive = await userService.getActiveStatus(email);
//         res.json({ isActive });
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// });

module.exports = router;