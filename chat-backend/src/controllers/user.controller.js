const { Op } = require('sequelize');
const User = require('../models/user.model');

class UserController {
  /**
   * GET /api/users?search=&limit=
   * Search / list all users (any authenticated user).
   * Returns safe user objects (no password).
   */
  async searchUsers(req, res, next) {
    try {
      const search = (req.query.search || '').trim();
      const limit  = Math.min(parseInt(req.query.limit) || 20, 100);

      const where = search
        ? {
            [Op.or]: [
              { username: { [Op.like]: `%${search}%` } },
              { email:    { [Op.like]: `%${search}%` } },
            ],
          }
        : {};

      const users = await User.findAll({
        where,
        limit,
        attributes: ['id', 'username', 'email', 'avatar', 'isOnline', 'presenceStatus', 'role'],
        order: [['username', 'ASC']],
      });

      res.json({
        success: true,
        data: {
          users: users.map(u => u.toJSON()),
        },
      });
    } catch (error) {
      next(error);
    }
  }
  /**
   * GET /api/users/:id
   * Fetch a single user's public profile by ID.
   */
  async getUserById(req, res, next) {
    try {
      const user = await User.findByPk(req.params.id, {
        attributes: ['id', 'username', 'email', 'avatar', 'bio', 'isOnline', 'presenceStatus', 'role', 'createdAt', 'location', 'website'],
      });

      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      res.json({ success: true, data: user.toJSON() });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = { userController: new UserController() };
