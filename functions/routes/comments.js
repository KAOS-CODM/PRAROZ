const express = require('express');
const { requireAdmin } = require('../services/auth');
const storage = require('../services/storage');
/*const { readComments, writeComments } = require('../services/jsonFallback');
const { Comment } = require('../models');*/

const router = express.Router();

router.post("/comments", express.json(), async (req, res) => {
    const { slug, name, comment } = req.body;

    if (!slug) {
        return res.status(400).json({
            error: "Recipe ID is required",
        });
    }

    if (!name || !comment) {
        return res.status(400).json({
            error: "Name and comment are required",
        });
    }

    try {
        const newComment = await storage.createComment({
            recipe_slug: slug,
            name,
            comment,
            approved: false,
            created_at: new Date(),
        });

        res.json({
            message: "Comment submitted successfully.",
            comment: newComment,
        });

    } catch (err) {
        console.error(err);

        res.status(500).json({
            error: "Error submitting comment",
        });
    }
});

router.get("/comments/:slug", async (req, res) => {
    try {
        const comments = await storage.getComments(
            req.params.slug,
            true
        );

        res.json(comments);

    } catch (err) {
        console.error(err);

        res.status(500).json({
            error: "Error fetching comments",
        });
    }
});

router.get("/comments-approved", requireAdmin, async (_req, res) => {
    try {

        const comments = await storage.getAllComments(true);

        const grouped = {};

        comments.forEach(comment => {

            if (!grouped[comment.recipe_slug]) {
                grouped[comment.recipe_slug] = [];
            }

            grouped[comment.recipe_slug].push(comment);

        });

        res.json(grouped);

    } catch (err) {
        console.error(err);

        res.status(500).json({
            error: "Error fetching approved comments",
        });
    }
});

router.get("/comments-pending", requireAdmin, async (_req, res) => {
    try {

        const comments = await storage.getAllComments(false);

        const grouped = {};

        comments.forEach(comment => {

            if (!grouped[comment.recipe_slug]) {
                grouped[comment.recipe_slug] = [];
            }

            grouped[comment.recipe_slug].push(comment);

        });

        res.json(grouped);

    } catch (err) {
        console.error(err);

        res.status(500).json({
            error: "Error fetching pending comments",
        });
    }
});

router.post("/approve-comment", requireAdmin, express.json(), async (req, res) => {

    const { id, recipeSlug } = req.body;

    if (!id || !recipeSlug) {
        return res.status(400).json({
            error: "Comment id and recipeSlug required",
        });
    }

    try {

        await storage.updateComment(id, recipeSlug, {
            approved: true,
        });

        res.json({
            message: "Comment approved successfully.",
        });

    } catch (err) {
        console.error(err);

        res.status(500).json({
            error: "Error approving comment",
        });
    }

});

router.post("/disapprove-comment", requireAdmin, express.json(), async (req, res) => {

    const { id, recipeSlug } = req.body;

    if (!id || !recipeSlug) {
        return res.status(400).json({
            error: "Comment id and recipeSlug required",
        });
    }

    try {

        await storage.updateComment(id, recipeSlug, {
            approved: false,
        });

        res.json({
            message: "Comment disapproved successfully.",
        });

    } catch (err) {
        console.error(err);

        res.status(500).json({
            error: "Error disapproving comment",
        });
    }

});

router.post("/delete-comment", requireAdmin, express.json(), async (req, res) => {

    const { id, recipeSlug } = req.body;

    if (!id || !recipeSlug) {
        return res.status(400).json({
            error: "Comment id and recipeSlug required",
        });
    }

    try {

        await storage.deleteComment(id, recipeSlug);

        res.json({
            message: "Comment deleted successfully.",
        });

    } catch (err) {
        console.error(err);

        res.status(500).json({
            error: "Error deleting comment",
        });
    }

});

router.post("/batch-comments", requireAdmin, express.json(), async (req, res) => {

    const { comments } = req.body;

    if (!comments || !comments.length) {
        return res.status(400).json({
            error: "No comments provided",
        });
    }

    try {

        await storage.batchUpdateComments(comments);

        const approved = comments.filter(c => c.action === "approve").length;
        const disapproved = comments.filter(c => c.action === "disapprove").length;
        const deleted = comments.filter(c => c.action === "delete").length;

        res.json({
            message: `✅ Approved ${approved}, ❌ Deleted ${deleted}, ↩ Disapproved ${disapproved}`,
        });

    } catch (err) {

        console.error(err);

        res.status(500).json({
            error: "Batch processing failed",
        });

    }

});
module.exports = router;

