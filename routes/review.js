const express = require('express');
const router = express.Router({ mergeParams: true });

const Listing = require('../models/listing.js'); 
const Review = require('../models/review.js');
const { isLoggedIn, validateReview, isReviewAuthor } = require('../middleware');  

const wrapAsync = require('../utils/wrapAsync.js');

router.post(
    '/',
    isLoggedIn,
    validateReview,
    wrapAsync(async (req, res) => {
        const listing = await Listing.findById(req.params.id);
        if (!listing) {
            req.flash('error', 'Cannot find that listing!');
            return res.redirect('/listings');
        }

        const review = new Review(req.body.review);
        review.author = req.user._id;
        await review.save();

        listing.reviews.push(review);
        await listing.save();

        req.flash('success', 'Created new review!');
        res.redirect(`/listings/${listing._id}`);
    })
);

router.delete(
    '/:reviewId',
    isLoggedIn,
    isReviewAuthor,
    wrapAsync(async (req, res) => {
        const { id, reviewId } = req.params;

        await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
        await Review.findByIdAndDelete(reviewId);

        req.flash('success', 'Review deleted');
        res.redirect(`/listings/${id}`);
    })
);

module.exports = router;


