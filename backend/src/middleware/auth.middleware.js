const JWTConfig = require('../../config/jwt.config');

class AuthMiddleware {
  static verifyAccessToken(req, res, next) {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
          message: 'Access token không được cung cấp hoặc định dạng không hợp lệ.'
        });
      }

      const token = authHeader.substring(7);
      const decoded = JWTConfig.verifyAccessToken(token);

      req.user = decoded;
      next();
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
          message: 'Access token đã hết hạn.'
        });
      }

      return res.status(403).json({
        message: 'Access token không hợp lệ.'
      });
    }
  }

  static verifyAdmin(req, res, next) {
    try {
      if (req.user.role !== 'Admin') {
        return res.status(403).json({
          message: 'Chỉ quản trị viên mới có thể sử dụng chức năng này.'
        });
      }

      next();
    } catch (error) {
      return res.status(403).json({
        message: 'Lỗi xác thực quyền quản trị viên.'
      });
    }
  }

  static verifyAdminOrHR(req, res, next) {
    try {
      if (req.user.role !== 'Admin' && req.user.role !== 'HR') {
        return res.status(403).json({
          message: 'Chỉ quản trị viên hoặc nhân viên HR mới có quyền truy cập.'
        });
      }

      next();
    } catch (error) {
      return res.status(403).json({
        message: 'Lỗi xác thực quyền truy cập.'
      });
    }
  }
}

module.exports = AuthMiddleware;
