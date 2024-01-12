// It will be done later

// const express = require("express");
// const router = express.Router();
// const Admin = require("../models/Admin");

// router.post("/", async (req, res) => {
//   try {
//     const admin = new Admin(req.body);
//     await admin.save();
//     res.status(201).json(admin);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// router.delete("/:id", async (req, res) => {
//   try {
//     const admin = await Admin.findByIdAndDelete(req.params.id);
//     if (!admin) {
//       return res.status(404).json({ error: "Admin not found" });
//     }
//     res.json({ message: "Admin deleted successfully" });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// router.put("/:id", async (req, res) => {
//   try {
//     const admin = await Admin.findByIdAndUpdate(req.params.id, req.body, {
//       new: true,
//     });
//     if (!admin) {
//       return res.status(404).json({ error: "Admin not found" });
//     }
//     res.json(admin);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// module.exports = router;
