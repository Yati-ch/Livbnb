const express = require("express");
const router = express.Router();
// routes/listing.js
const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js");
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");
const listingController = require("../controllers/listing.js");
const multer = require("multer");
const { storage } = require("../cloudConfig.js");

const upload = multer({ storage });

router.route("/")
    .get(wrapAsync(listingController.index))
    .post(
        isLoggedIn,
        upload.single("listing[image]"),
        validateListing,
        wrapAsync(listingController.createListing)
    );

router.get("/new", isLoggedIn, listingController.renderNewForm);

router.get("/category/:category", wrapAsync(async (req, res) => {
    const category = req.params.category;
    const listings = await Listing.find({ category });
    return res.render("./listings/category", { listings, category });
}));

router.get("/search", wrapAsync(async (req, res) => {
    const { q } = req.query;

    if (!q) {
        return res.redirect("/listings"); // Redirect safely if no query
    }

    const allListings = await Listing.find({
        $or: [
            { title: { $regex: q, $options: "i" } },
            { location: { $regex: q, $options: "i" } },
            { country: { $regex: q, $options: "i" } }
        ]
    });

    return res.render("listings/index", { allListings, searchQuery: q });
}));

router.route("/:id")
    .get(wrapAsync(listingController.showListing))
    .put(
        isLoggedIn,
        isOwner,
        upload.single("listing[image]"),
        validateListing,
        wrapAsync(listingController.renderUpdateForm)
    )
    .delete(
        isLoggedIn,
        isOwner,
        wrapAsync(listingController.renderDelete)
    );

router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(listingController.editListing));

module.exports = router;




