var router = require('express').Router();
var mongoose = require('mongoose');
var Article = mongoose.model('Article');


router.get('/', function (req, res, next) {
    Article.aggregate([
        { $match: { tagList: { $ne: null } } },
        { $project: { _id: 0, tagList: 1 } },
        { $unwind: "$tagList" },
        { $group: { _id: "$tagList", occ: { $sum: 1 } } },
        { $project: { _id: 0, tag: "$_id", occ: 1 } },
        { $sort: { occ: -1 } }
    ]).then(function (tags) {
        return res.json({ tags: tags.map(function(el) { return el.tag}) });
    }).catch(next);
});

module.exports = router;