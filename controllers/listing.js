const Listing = require("../models/listing");

module.exports.index = async (req, res) => {
    const allListings = await Listing.find({})
    .select("title price location country image category")
    .sort({ createdAt: -1 })
    .lean();
    res.render("listings/index.ejs", {
        allListings,
        searchQuery: null
    });
};

// ================= NEW FORM =================
module.exports.renderNewForm = (req, res) => {
    res.render("listings/new.ejs");
};

module.exports.showListing = async (req, res) => {
    const { id } = req.params;

    const listing = await Listing.findById(id)
        .populate("owner", "username") 
        .populate({
            path: "reviews",
            select: "rating comment",
            populate: { path: "author", select: "username" }
        })
        .lean();

    if (!listing) {
        req.flash("error", "Listing does not exist!");
        return res.redirect("/listings");
    }
    if (!listing.owner) {
    listing.owner = { username: "Delta" };
}

    res.render("listings/show.ejs", { listing });
};

module.exports.createListing = async (req, res, next) => {
    try {
        const newListing = new Listing(req.body.listing);
        newListing.owner = req.user._id;

        if (req.file) {
            newListing.image = {
                url: req.file.path,
                filename: req.file.filename
            };
        }

        await newListing.save(); 

        req.flash("success", "New Listing Created!");
        res.redirect(`/listings/${newListing._id}`);

    } catch (e) {
        next(e);
    }
};

module.exports.editListing = async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id).lean();

    if (!listing) {
        req.flash("error", "Listing does not exist!");
        return res.redirect("/listings");
    }

    let originalImageUrl = listing.image?.url;
    if (originalImageUrl) {
        originalImageUrl = originalImageUrl.replace(
            "/upload",
            "/upload/h_300,w_250,q_auto"
        );
    }

    res.render("listings/edit.ejs", { listing, originalImageUrl });
};

module.exports.renderUpdateForm = async (req, res) => {
    const { id } = req.params;

    const updateData = { ...req.body.listing };

    if (req.file) {
        updateData.image = {
            url: req.file.path,
            filename: req.file.filename
        };
    }

    await Listing.findByIdAndUpdate(id, updateData);

    req.flash("success", "Updated Listing!");
    res.redirect(`/listings/${id}`);
};

module.exports.renderDelete = async (req, res) => {
    const { id } = req.params;
    await Listing.findByIdAndDelete(id);
    req.flash("success", "Deleted Listing!");
    res.redirect("/listings");
};

