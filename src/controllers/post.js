const { PrismaClient, Prisma } = require("@prisma/client");
const {
  updateQuery,
  checkMissingFields,
  message,
  postOwnComment,
  buildPublishedClause,
} = require("./utils");
const prisma = new PrismaClient();

const getPosts = async (req, res) => {
  const query = {
    page: 1,
    perPage: 10,
    order_by: "latest",
  };
  if (req.query) {
    updateQuery(query, req.query);
    query.published = buildPublishedClause(query);
  }

  const posts = await prisma.post.findMany({
    where: {
      publishedAt: query.published,
    },
    skip: Number(query.perPage) * (Number(query.page) - 1),
    take: Number(query.perPage),
    orderBy: {
      publishedAt: query.order_by === "oldest" ? "asc" : "desc",
    },
  });

  res.status(200).json({ posts });
};

const createComment = async (req, res) => {
  const postId = Number(req.params.postId);
  const { userId, content } = req.body;

  if (checkMissingFields([userId, content])) {
    return res.status(400).json({ error: message.missingFields });
  }

  try {
    const comment = await prisma.comment.create({
      data: {
        postId,
        userId,
        content,
      },
    });
    res.status(201).json({ comment });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === "P2003") {
        return res.status(404).json({ error: message.postNotExists });
      }
    }

    res.json({ error: err });
  }
};

const createReplyComment = async (req, res) => {
  const postId = Number(req.params.postId);
  const commentId = Number(req.params.commentId);
  const { userId, content } = req.body;

  if (checkMissingFields([userId, content])) {
    return res.status(400).json({ error: message.missingFields });
  }

  const found = await postOwnComment(commentId, postId);
  if (!found) {
    return res.status(404).json({ error: message.postOrCommentNoExists });
  }

  try {
    const comment = await prisma.comment.create({
      data: {
        content,
        userId,
        postId,
        parentId: commentId,
      },
    });

    res.status(201).json({ comment });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === "P2003") {
        return res.status(404).json({ error: message.postOrCommentNoExists });
      }
    }

    res.json({ error: err });
  }
};

const updateComment = async (req, res) => {
  const postId = Number(req.params.postId);
  const commentId = Number(req.params.commentId);
  const { userId, content } = req.body;

  if (checkMissingFields([userId, content])) {
    return res.status(400).json({ error: message.missingFields });
  }

  try {
    const comment = await prisma.comment.update({
      where: { id: commentId },
      data: {
        content,
        userId,
      },
    });

    res.status(201).json({ comment });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === "P2003") {
        return res.status(404).json({ error: message.postOrCommentNoExists });
      }
    }

    res.json({ error: err });
  }
};

const deleteComment = async (req, res) => {
  const postId = Number(req.params.postId);
  const commentId = Number(req.params.commentId);

  const found = await postOwnComment(commentId, postId);
  if (!found) {
    return res.status(404).json({ error: message.postOrCommentNoExists });
  }

  const comment = await prisma.comment.delete({
    where: {
      id: commentId,
    },
  });
  res.status(201).json({ comment });
};

module.exports = {
  getPosts,
  createComment,
  createReplyComment,
  updateComment,
  deleteComment,
};
